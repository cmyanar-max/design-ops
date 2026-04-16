export function Footer() {
    return (
        <footer className="w-full bg-gradient-to-b from-primary/5 to-background text-foreground shrink-0 border-t mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
                <div className="flex items-center space-x-3 mb-6">
                    <img 
                      alt="DesignOps Logo" 
                      className="h-10"
                      src="/do_logo.svg" 
                    />
                </div>
                <p className="text-center max-w-xl text-sm font-normal leading-relaxed text-muted-foreground">
                    Tasarım ekiplerini yapay zeka araçlarıyla güçlendiriyoruz. Fikirlerinizi gerçeğe dönüştürün, iş akışlarınızı hızlandırın.
                </p>
            </div>
            <div className="border-t border-border">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center">
                    <div className="mb-4 space-x-6 text-sm">
                        <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Gizlilik Politikası</a>
                        <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Kullanım Şartları</a>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                        <a href="/" className="font-medium text-foreground hover:text-primary transition-colors">DesignOps</a> ©2026. Tüm hakları saklıdır.
                    </p>
                </div>
            </div>
        </footer>
    );
}
