import { useSkipToMain } from '../../hooks/useKeyboardNavigation';

export default function SkipToMain() {
  const { handleSkipClick } = useSkipToMain();

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        handleSkipClick();
      }}
      className="fixed top-0 left-0 -translate-y-full focus:translate-y-0 focus:z-50 px-4 py-2 bg-primary text-white font-semibold rounded-br-lg transition-transform duration-200"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
