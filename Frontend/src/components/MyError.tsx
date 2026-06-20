

export default function ErrorFallback({error}:
 {error: Error}) {
 return (
 <div>
 <h1>Error: </h1>
 <pre>{error.message}</pre>
 <pre>{error.stack}</pre>
 </div>
 ) 
}
