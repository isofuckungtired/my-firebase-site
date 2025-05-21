
export function AppFooter() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 md:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 公子請讀書. 版權所有.</p>
      </div>
    </footer>
  );
}
