import { PrismaClient } from '@prisma/client'
import { trace, SpanStatusCode } from '@opentelemetry/api'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create database tracer
const tracer = trace.getTracer('database', '1.0.0')

// Helper function to extract operation details from Prisma params
function extractOperationDetails(params: any) {
  const model = params.model || 'unknown'
  const action = params.action || 'unknown'
  const table = model.toLowerCase()
  
  return {
    operation: `${action}-${model}`,
    table,
    action: action.toUpperCase(),
    model
  }
}

// Helper function to determine query type
function getQueryType(action: string): string {
  const action_lower = action.toLowerCase()
  if (action_lower.includes('find') || action_lower.includes('get')) return 'SELECT'
  if (action_lower.includes('create')) return 'INSERT'
  if (action_lower.includes('update')) return 'UPDATE'
  if (action_lower.includes('delete')) return 'DELETE'
  if (action_lower.includes('upsert')) return 'UPSERT'
  if (action_lower.includes('count')) return 'COUNT'
  return 'QUERY'
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Add OpenTelemetry middleware for database tracing
prisma.$use(async (params, next) => {
  const { operation, table, action, model } = extractOperationDetails(params)
  const queryType = getQueryType(action)
  
  // Create database span
  const span = tracer.startSpan(`db-${operation}`, {
    attributes: {
      'db.operation': operation,
      'db.table': table,
      'db.query_type': queryType,
      'db.action': action,
      'db.model': model,
      'db.system': 'postgresql',
      'db.name': 'pickleball_platform'
    }
  })

  const startTime = Date.now()
  let affectedRows = 0
  let success = true

  try {
    // Execute the query
    const result = await next(params)
    
    // Extract affected rows based on operation type
    if (Array.isArray(result)) {
      affectedRows = result.length
    } else if (result && typeof result === 'object') {
      if ('count' in result) {
        affectedRows = result.count as number
      } else if (result.id || result._count) {
        affectedRows = 1
      }
    }

    // Set success attributes
    span.setAttributes({
      'db.affected_rows': affectedRows,
      'db.success': true,
      'db.duration': Date.now() - startTime
    })
    
    span.setStatus({ code: SpanStatusCode.OK })
    return result
  } catch (error) {
    success = false
    
    // Record the exception and set error status
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Database operation failed'
    })
    
    span.setAttributes({
      'db.success': false,
      'db.duration': Date.now() - startTime,
      'db.error': error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw error
  } finally {
    span.end()
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma