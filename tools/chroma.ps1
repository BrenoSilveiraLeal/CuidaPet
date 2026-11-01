# Tira o fundo verde (#00FF00) ou magenta (#FF00FF) dos mascotes gerados e salva PNG transparente 800x800.
# Uso: powershell -ExecutionPolicy Bypass -File tools/chroma.ps1
# Lê tools/mascotes-brutos/<nome>.png e grava cuidapet/assets/img/<nome>.png. Depois rode tools/rosa.ps1.

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Chroma {
  static double Ramp(double x, double a, double b) { return x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a); }

  public static void Convert(string src, string dst, bool magenta, int size) {
    using (var input = new Bitmap(src))
    using (var bmp = input.Clone(new Rectangle(0, 0, input.Width, input.Height), PixelFormat.Format32bppArgb)) {
      int W = bmp.Width, H = bmp.Height;
      var data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      var px = new byte[data.Stride * H];
      Marshal.Copy(data.Scan0, px, 0, px.Length);
      int minX = W, minY = H, maxX = 0, maxY = 0;
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        int i = y * data.Stride + x * 4;
        double b = px[i], g = px[i + 1], r = px[i + 2];
        // quanto o pixel "é fundo": verde acima de vermelho/azul, ou magenta acima do verde
        double key = magenta ? (Math.Min(r, b) - g) / 255.0 : (g - Math.Max(r, b)) / 255.0;
        double a = 1 - Ramp(key, 0.12, 0.42);
        if (key > 0) { // remove o reflexo da cor do fundo nas bordas
          if (magenta) { double s = Math.Min(r, b) - g; r -= s; b -= s; }
          else g = Math.Max(r, b);
        }
        px[i] = (byte)Math.Max(0, Math.Min(255, b)); px[i + 1] = (byte)Math.Max(0, Math.Min(255, g)); px[i + 2] = (byte)Math.Max(0, Math.Min(255, r));
        px[i + 3] = (byte)Math.Round(255 * a);
        if (a > 0.5) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      }
      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);
      // recorta no animal e centraliza num quadrado com uma margem pequena, apoiado embaixo
      int cw = maxX - minX + 1, ch = maxY - minY + 1;
      int side = (int)(Math.Max(cw, ch) * 1.04);
      using (var outBmp = new Bitmap(size, size, PixelFormat.Format32bppArgb))
      using (var gr = Graphics.FromImage(outBmp)) {
        gr.Clear(Color.Transparent);
        gr.InterpolationMode = InterpolationMode.HighQualityBicubic;
        gr.PixelOffsetMode = PixelOffsetMode.HighQuality;
        gr.CompositingMode = CompositingMode.SourceCopy;
        double sc = (double)size / side;
        float dw = (float)(cw * sc), dh = (float)(ch * sc);
        float dx = (size - dw) / 2, dy = size - dh - (float)(size * 0.01);
        gr.DrawImage(bmp, new RectangleF(dx, dy, dw, dh), new RectangleF(minX, minY, cw, ch), GraphicsUnit.Pixel);
        outBmp.Save(dst, ImageFormat.Png);
      }
    }
  }
}
'@

$raw = Join-Path $PSScriptRoot 'mascotes-brutos'
$img = Join-Path $PSScriptRoot '..\cuidapet\assets\img'
$magenta = @('turtle', 'frog') # bichos verdes foram gerados em fundo magenta
foreach ($f in Get-ChildItem $raw -Filter *.png) {
  [Chroma]::Convert($f.FullName, (Join-Path $img $f.Name), $magenta -contains $f.BaseName, 800)
  Write-Output "ok  $($f.Name)"
}
