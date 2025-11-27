export function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#D9D9D9" }}
      className="flex w-full flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 border-t border-blue-gray-50 py-6 text-center md:justify-between px-10"
    >
      <p className="text-blue-gray-700 font-normal">
        &copy; 2025 QuickPark
      </p>
      <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
        <li>
          <a
            href="/about"
            className="text-blue-gray-700 font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            Sobre nosotros
          </a>
        </li>
        <li>
          <a
            href="/contact"
            className="text-blue-gray-700 font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
          >
            Contáctanos
          </a>
        </li>
      </ul>
    </footer>
  );
}
