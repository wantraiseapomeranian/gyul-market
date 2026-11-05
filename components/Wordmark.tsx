export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <p className={`wordmark ${inverse ? 'wordmark-inverse' : ''}`}>
      귤상회<span className="seal" aria-hidden="true">選</span>
    </p>
  );
}
