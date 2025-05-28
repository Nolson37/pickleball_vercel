# Next.js Tracing Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Turbopack Tracing for Development](#turbopack-tracing-for-development)
3. [OpenTelemetry for Production Observability](#opentelemetry-for-production-observability)
4. [Implementation Comparison](#implementation-comparison)
5. [Decision Framework](#decision-framework)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

This guide covers two primary tracing approaches for Next.js applications:

1. **Turbopack Tracing**: For local development performance analysis and debugging
2. **OpenTelemetry**: For production observability, monitoring, and APM integration

Both approaches serve different purposes and can be used complementarily in a comprehensive observability strategy.

## Turbopack Tracing for Development

### Purpose and Use Cases

Turbopack tracing helps you understand performance bottlenecks during local development by providing detailed information about:

- Module compilation times
- Build process performance
- Dependency relationships
- Development server optimization opportunities

### Implementation

#### Prerequisites

- Latest version of Next.js (15.3.2+)
- Turbopack enabled development environment

#### Step 1: Enable Turbopack Development Mode

```bash
# Start Next.js with Turbopack
npm run dev --turbopack
# or
next dev --turbopack
```

#### Step 2: Generate Turbopack Traces

```bash
# Enable tracing environment variable
NEXT_TURBOPACK_TRACING=1 npm run dev --turbopack

# Navigate your application or make edits to reproduce performance issues
# Stop the development server (Ctrl+C)
```

#### Step 3: Analyze Trace Files

```bash
# A trace file will be generated in .next/trace-turbopack
# Use Next.js internal trace viewer
next internal trace .next/trace-turbopack

# For newer versions, the command might be:
next internal turbo-trace-server .next/trace-turbopack
```

#### Step 4: View Traces

- Once the trace server is running, visit `https://trace.nextjs.org/`
- Upload your trace file or connect to the local trace server
- Switch from "Aggregated in order" to "Spans in order" for individual timing analysis

### Advanced Configuration

#### Detailed Fetch Logging

Add to your `next.config.js`:

```javascript
module.exports = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}
```

#### Turbopack Profiling

```bash
# Generate performance profile with verbose output
turbo run build --profile=profile.json -vvv
```

### Common Performance Issues Identified

1. **Barrel file imports**: Large re-exports causing slow compilation
2. **Antivirus interference**: File system access delays
3. **Icon library over-imports**: Importing entire icon sets
4. **Tailwind CSS misconfiguration**: Scanning unnecessary directories
5. **Custom webpack settings**: Incompatible configurations

## OpenTelemetry for Production Observability

### Purpose and Use Cases

OpenTelemetry provides comprehensive observability for production applications:

- Request tracing across distributed systems
- Performance monitoring and APM integration
- Error tracking and debugging
- Business metrics and custom instrumentation
- Integration with monitoring platforms (DataDog, New Relic, etc.)

### Implementation Options

#### Option 1: Using @vercel/otel (Recommended for Vercel)

##### Installation

```bash
npm install @opentelemetry/api @vercel/otel
```

##### Basic Setup

Create `instrumentation.ts` in your project root (or `src/` if using src directory):

```typescript
// instrumentation.ts
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({ 
    serviceName: 'your-project-name' 
  });
}
```

##### Advanced Configuration

```typescript
// instrumentation.ts
import { registerOTel, OTLPHttpJsonTraceExporter } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'your-project-name',
    traceExporter: new OTLPHttpJsonTraceExporter({
      url: 'https://your-trace-exporter-url',
      headers: {
        'authentication-header-name': 'authentication-header-value',
      },
    }),
  });
}
```

#### Option 2: Manual OpenTelemetry Configuration

##### Installation

```bash
npm install @opentelemetry/sdk-node @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/sdk-trace-node @opentelemetry/exporter-trace-otlp-http
```

##### Setup for Node.js Runtime

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node.ts');
  }
}
```

```typescript
// instrumentation.node.ts
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: 'next-app',
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
});

sdk.start();
```

### Next.js Configuration

#### Enable Instrumentation Hook (Next.js 13 & 14)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true, // Not required in Next.js 15+
  },
};

module.exports = nextConfig;
```

### Custom Spans and Instrumentation

#### Creating Custom Spans

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('example-tracer');

// Manual span creation
tracer.startActiveSpan('fetchGithubStars', async (span) => {
  try {
    const result = await fetchData();
    span.setAttributes({
      'custom.attribute': 'value',
    });
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ 
      code: SpanStatusCode.ERROR, 
      message: error.message 
    });
    throw error;
  } finally {
    span.end();
  }
});
```

#### Getting Active Span

```typescript
import { trace } from '@opentelemetry/api';

const activeSpan = trace.getActiveSpan();
if (activeSpan) {
  activeSpan.setAttributes({
    'user.id': userId,
    'request.path': request.path,
  });
}
```

### Default Next.js Spans

Next.js automatically instruments several spans:

| Span Type | Description | Attributes |
|-----------|-------------|------------|
| `[http.method] [next.route]` | Root span for each request | `http.method`, `http.status_code`, `next.route` |
| `render route (app) [next.route]` | App router rendering | `next.route` |
| `fetch [http.method] [http.url]` | Fetch requests | `http.method`, `http.url` |
| `executing api route (app) [next.route]` | API route execution | `next.route` |
| `getServerSideProps [next.route]` | SSR data fetching | `next.route` |
| `getStaticProps [next.route]` | SSG data fetching | `next.route` |

### Environment Configuration

#### Vercel Platform

Set environment variables in Vercel dashboard:

```bash
# Enable verbose tracing
NEXT_OTEL_VERBOSE=1

# Disable fetch instrumentation if needed
NEXT_OTEL_FETCH_DISABLED=1
```

#### Self-Hosted Deployments

Configure OpenTelemetry Collector following the [official guide](https://opentelemetry.io/docs/collector/getting-started/).

## Implementation Comparison

| Aspect | Turbopack Tracing | OpenTelemetry |
|--------|-------------------|---------------|
| **Purpose** | Development performance debugging | Production observability |
| **Environment** | Local development only | Production and staging |
| **Scope** | Build process and compilation | Application requests and business logic |
| **Output** | Local trace files for analysis | APM platforms, logs, metrics |
| **Cost** | Free, built into Next.js | Depends on APM vendor |
| **Setup Complexity** | Minimal (environment variable) | Moderate (instrumentation setup) |
| **Real-time Monitoring** | No | Yes |
| **Historical Data** | Limited to current session | Long-term retention |

## Decision Framework

### Use Turbopack Tracing When:

- ✅ Debugging slow local development builds
- ✅ Optimizing development server performance
- ✅ Identifying compilation bottlenecks
- ✅ Analyzing module dependency impact
- ✅ Troubleshooting development environment issues

### Use OpenTelemetry When:

- ✅ Monitoring production application performance
- ✅ Tracking user requests and API calls
- ✅ Integrating with APM platforms
- ✅ Implementing distributed tracing
- ✅ Creating custom business metrics
- ✅ Debugging production issues

### Combined Approach:

For comprehensive observability, implement both:

1. **Development Phase**: Use Turbopack tracing to optimize build performance
2. **Production Phase**: Use OpenTelemetry for runtime observability
3. **CI/CD Pipeline**: Integrate both for end-to-end visibility

## Best Practices

### Turbopack Tracing Best Practices

1. **Regular Performance Audits**
   ```bash
   # Run periodic traces to catch performance regressions
   NEXT_TURBOPACK_TRACING=1 npm run dev --turbopack
   ```

2. **Optimize Based on Findings**
   - Replace barrel imports with direct imports
   - Configure Tailwind CSS content scanning appropriately
   - Remove unused dependencies

3. **Share Traces with Team**
   - Include trace files in performance issue reports
   - Document common performance patterns

### OpenTelemetry Best Practices

1. **Structured Service Naming**
   ```typescript
   // Use consistent naming conventions
   registerOTel({ 
     serviceName: 'pickleball-platform-api' 
   });
   ```

2. **Meaningful Span Names and Attributes**
   ```typescript
   span.setAttributes({
     'organization.id': organizationId,
     'user.role': userRole,
     'operation.type': 'facility_creation',
   });
   ```

3. **Error Handling**
   ```typescript
   try {
     await operation();
   } catch (error) {
     span.recordException(error);
     span.setStatus({ 
       code: SpanStatusCode.ERROR, 
       message: error.message 
     });
     throw error;
   }
   ```

4. **Performance Considerations**
   - Use `BatchSpanProcessor` for production
   - Implement sampling for high-traffic applications
   - Configure appropriate span retention policies

5. **Security**
   - Avoid logging sensitive data in spans
   - Use environment variables for API keys
   - Implement proper access controls for trace data

## Troubleshooting

### Turbopack Tracing Issues

#### No Trace File Generated

```bash
# Ensure environment variable is set correctly
NEXT_TURBOPACK_TRACING=1 npm run dev --turbopack

# Check .next directory for trace files
ls -la .next/trace-turbopack*
```

#### Trace Viewer Not Working

```bash
# Try alternative trace command
next internal turbo-trace-server .next/trace-turbopack

# Or use online viewer at https://trace.nextjs.org/
```

### OpenTelemetry Issues

#### Spans Not Appearing

1. **Check instrumentation file location**
   ```
   ✅ /instrumentation.ts (project root)
   ✅ /src/instrumentation.ts (if using src directory)
   ❌ /pages/instrumentation.ts (incorrect)
   ```

2. **Verify environment variables**
   ```bash
   # For debugging
   NEXT_OTEL_VERBOSE=1
   ```

3. **Confirm APM integration setup**
   - Verify API keys and endpoints
   - Check integration configuration in Vercel dashboard

#### Performance Impact

1. **Use appropriate span processors**
   ```typescript
   // Development: SimpleSpanProcessor
   // Production: BatchSpanProcessor
   ```

2. **Implement sampling**
   ```typescript
   import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-node';
   
   const sdk = new NodeSDK({
     sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
   });
   ```

#### Missing Context in Edge Runtime

```typescript
// Use @vercel/otel for Edge Runtime compatibility
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({ serviceName: 'your-app' });
}
```

### Getting Help

- **Turbopack Issues**: [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- **OpenTelemetry Issues**: [OpenTelemetry Community](https://github.com/open-telemetry/opentelemetry-js)
- **Vercel-specific Issues**: [Vercel Discord](https://vercel.com/discord)

## Additional Resources

- [Next.js Instrumentation Documentation](https://nextjs.org/docs/app/guides/instrumentation)
- [OpenTelemetry JavaScript Documentation](https://opentelemetry.io/docs/languages/js/)
- [Vercel OpenTelemetry Overview](https://vercel.com/docs/observability/otel-overview)
- [Turbopack Performance Optimization](https://nextjs.org/docs/app/guides/local-development)
- [@vercel/otel GitHub Repository](https://github.com/vercel/otel)

---

*Last Updated: May 28, 2025*
*Research Sources: Next.js Documentation, OpenTelemetry Official Docs, Vercel Documentation, Context7 Code Examples*