import Header from './Header';
import Footer from './Footer';
import JuzSidebar from './JuzSidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 py-8 gap-8">
        <main className="flex-1 min-w-0">{children}</main>
        <JuzSidebar />
      </div>
      <Footer />
    </div>
  );
}
