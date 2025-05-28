import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { trace, SpanStatusCode } from '@opentelemetry/api'

// Create utils tracer
const tracer = trace.getTracer('utils', '1.0.0')

/**
 * Combine and merge Tailwind CSS classes
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  const span = tracer.startSpan('utils-cn', {
    attributes: {
      'function.name': 'cn',
      'inputs.count': inputs.length,
      'inputs.types': inputs.map(input => typeof input).join(',')
    }
  })

  try {
    // Convert inputs to a serializable format for logging
    const inputsString = inputs.map(input => {
      if (typeof input === 'string') return input
      if (typeof input === 'object' && input !== null) return JSON.stringify(input)
      return String(input)
    }).join(' ')

    const result = twMerge(clsx(inputs))
    
    span.setAttributes({
      'inputs.string': inputsString.substring(0, 200), // Limit to prevent huge attributes
      'result.length': result.length,
      'result.classes': result.substring(0, 200), // Limit to prevent huge attributes
      'function.result': 'success'
    })
    span.setStatus({ code: SpanStatusCode.OK })
    
    return result
  } catch (error) {
    span.recordException(error as Error)
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Failed to merge classes'
    })
    span.setAttributes({
      'function.result': 'error'
    })
    throw error
  } finally {
    span.end()
  }
}
