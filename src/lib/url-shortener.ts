// src/lib/url-shortener.ts

// Daftar API URL shortener yang bisa digunakan
// Menggunakan free tier dari beberapa layanan popular

// TinyURL API
async function shortenWithTinyURL(longUrl: string): Promise<string> {
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (!response.ok) {
        throw new Error('TinyURL API error');
      }
      return await response.text();
    } catch (error) {
      console.error('Error shortening URL with TinyURL:', error);
      throw error;
    }
  }
  
  // Rebrandly API (optional, perlu API key)
  async function shortenWithRebrandly(longUrl: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch('https://api.rebrandly.com/v1/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          destination: longUrl,
          domain: { fullName: 'rebrand.ly' }
        })
      });
      
      if (!response.ok) {
        throw new Error('Rebrandly API error');
      }
      
      const data = await response.json();
      return `https://${data.shortUrl}`;
    } catch (error) {
      console.error('Error shortening URL with Rebrandly:', error);
      throw error;
    }
  }
  
  // Local URL shortener menggunakan localStorage
  // Ini adalah fallback jika API external tidak tersedia
  class LocalUrlShortener {
    private readonly storageKey = 'splitbill_short_urls';
    
    private getUrlMap(): Record<string, string> {
      try {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    }
    
    private saveUrlMap(map: Record<string, string>): void {
      localStorage.setItem(this.storageKey, JSON.stringify(map));
    }
    
    // Generate short random string (untuk ID)
    private generateShortId(length = 6): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
    
    public shortenUrl(longUrl: string): string {
      const urlMap = this.getUrlMap();
      
      // Check if URL already shortened
      for (const [shortId, url] of Object.entries(urlMap)) {
        if (url === longUrl) {
          return this.getShortUrl(shortId);
        }
      }
      
      // Generate new short ID
      let shortId = this.generateShortId();
      while (urlMap[shortId]) {
        shortId = this.generateShortId();
      }
      
      // Save the mapping
      urlMap[shortId] = longUrl;
      this.saveUrlMap(urlMap);
      
      return this.getShortUrl(shortId);
    }
    
    public getLongUrl(shortId: string): string | null {
      const urlMap = this.getUrlMap();
      return urlMap[shortId] || null;
    }
    
    private getShortUrl(shortId: string): string {
      return `${window.location.origin}/s/${shortId}`;
    }
  }
  
  // Main function to shorten URL
  export async function shortenUrl(longUrl: string): Promise<string> {
    try {
      // First try with TinyURL (no API key needed)
      return await shortenWithTinyURL(longUrl);
    } catch (error) {
      console.warn('External URL shortener failed, using local shortener as fallback');
      
      // Fallback to local shortener
      const localShortener = new LocalUrlShortener();
      return localShortener.shortenUrl(longUrl);
    }
  }
  
  // Function to expand shortened URL created by our local shortener
  export function expandLocalUrl(shortId: string): string | null {
    const localShortener = new LocalUrlShortener();
    return localShortener.getLongUrl(shortId);
  }