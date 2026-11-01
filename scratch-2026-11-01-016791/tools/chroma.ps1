param([string]$In, [string]$Out, [string]$Preview = "", [int]$AvgDespill = 1, [int]$Erode = 2, [int]$Magenta = 0)
# Remove o fundo verde (#00FF00) das imagens geradas e salva PNG com transparÃªncia.
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class Chroma {
  public static void Key(string inPath, string outPath, string previewPath, bool avgDespill, int erode, bool magenta) {
    using (var src = new Bitmap(inPath))
    using (var bmp = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, src.Width, src.Height);
      int w = bmp.Width, h = bmp.Height;
      var rect = new Rectangle(0, 0, w, h);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = data.Stride, n = stride * h;
      var px = new byte[n];
      Marshal.Copy(data.Scan0, px, 0, n);
      var alpha = new byte[w * h];
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        int i = y * stride + x * 4;
        int b = px[i], gr = px[i + 1], r = px[i + 2];
        double a;
        if (magenta) {
          int mn = Math.Min(r, b);
          int d = mn - gr;
          a = 1.0 - (d - 15) / 70.0;
          if (d > 0) { r -= d; b -= d; }
        } else {
          int m = Math.Max(r, b);
          int d = gr - m;
          a = 1.0 - (d - 15) / 70.0;
          int lim = avgDespill ? (r + b) / 2 : m;
          if (gr > lim) gr = lim;
        }
        if (a < 0) a = 0; if (a > 1) a = 1;
        px[i] = (byte)b; px[i + 1] = (byte)gr; px[i + 2] = (byte)r;
        alpha[y * w + x] = (byte)(a * 255);
      }
      // ErosÃ£o do alfa para eliminar a franja verde nas bordas.
      for (int pass = 0; pass < erode; pass++) {
        var next = (byte[])alpha.Clone();
        for (int y = 1; y < h - 1; y++) for (int x = 1; x < w - 1; x++) {
          int k = y * w + x;
          byte mn = alpha[k];
          if (alpha[k - 1] < mn) mn = alpha[k - 1];
          if (alpha[k + 1] < mn) mn = alpha[k + 1];
          if (alpha[k - w] < mn) mn = alpha[k - w];
          if (alpha[k + w] < mn) mn = alpha[k + w];
          next[k] = mn;
        }
        alpha = next;
      }
      for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
        int i = y * stride + x * 4;
        byte a = alpha[y * w + x];
        px[i + 3] = a;
        if (a == 0) { px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; }
      }
      Marshal.Copy(px, 0, data.Scan0, n);
      bmp.UnlockBits(data);
      bmp.Save(outPath, ImageFormat.Png);
      if (previewPath.Length > 0) {
        using (var pv = new Bitmap(w, h))
        using (var g = Graphics.FromImage(pv)) {
          g.Clear(Color.FromArgb(2, 132, 199));
          g.DrawImage(bmp, 0, 0, w, h);
          pv.Save(previewPath, ImageFormat.Png);
        }
      }
    }
  }
}
"@
$full = { param($p) [IO.Path]::GetFullPath((Join-Path (Get-Location) $p)) }
$pv = ""; if ($Preview) { $pv = & $full $Preview }
[Chroma]::Key((& $full $In), (& $full $Out), $pv, [bool]$AvgDespill, $Erode, [bool]$Magenta)

