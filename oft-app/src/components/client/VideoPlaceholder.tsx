/**
 * Заглушка для видео упражнения
 */

export default function VideoPlaceholder() {
  return (
    <div
      className="aspect-video rounded-lg flex items-center justify-center border-2 border-dashed"
      style={{
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="text-center">
        <div className="text-5xl mb-3">📹</div>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Видео скоро появится
        </p>
      </div>
    </div>
  );
}
