# Gera a versão "fêmea" de cada mascote: troca o azul dos acessórios (óculos e coleira) por rosa.
# Uso: powershell -ExecutionPolicy Bypass -File tools/rosa.ps1
# Cria <nome>-f.png ao lado de cada PNG em cuidapet/assets/img e cuidapet/assets/img/breeds.
# Para mascotes que têm azul no próprio corpo (ex.: betta), $regions limita a troca à área dos acessórios.

param([string[]]$Only = @())

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Rosa {
  static double Ramp(double x, double a, double b) { return x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a); }

  // Peso 0..1 de "azul dos acessórios": matiz azul (195..250), saturação e brilho mínimos, com bordas suaves
  static double Weight(byte[] px, int i) {
    if (px[i + 3] == 0) return 0;
    double b = px[i] / 255.0, g = px[i + 1] / 255.0, rr = px[i + 2] / 255.0;
    double max = Math.Max(rr, Math.Max(g, b)), min = Math.Min(rr, Math.Min(g, b)), d = max - min;
    if (d < 1e-6 || max != b) return 0; // só tons em que o azul domina
    double h = 60 * (((rr - g) / d) + 4);
    return Ramp(h, 188, 200) * (1 - Ramp(h, 268, 282)) * Ramp(d / max, 0.28, 0.45) * Ramp(max, 0.16, 0.3);
  }

  // seeds: pontos [x,y] (frações) sobre os acessórios. Com sementes, só o azul ligado a elas muda de cor
  // (preenchimento por vizinhança), para não pintar olhos ou penas azuis. regions limita a área, se houver.
  // keep: olhos azuis a preservar, [cx, cy, r, x1, y1, x2, y2]: dentro do círculo, só muda o que fica
  // abaixo da linha (x1,y1)-(x2,y2), que é a borda de cima da armação passando na frente do olho.
  static bool Kept(double[][] keep, double fx, double fy) {
    if (keep == null) return false;
    foreach (var k in keep) {
      double dx = fx - k[0], dy = fy - k[1];
      if (dx * dx + dy * dy > k[2] * k[2]) continue;
      double lineY = k[4] + (k[6] - k[4]) * (fx - k[3]) / (k[5] - k[3]);
      if (fy < lineY) return true;
    }
    return false;
  }

  public static void Convert(string src, string dst, double[][] seeds, double[][] regions, double[][] keep) {
    using (var bmp = new Bitmap(src)) {
      var rect = new Rectangle(0, 0, bmp.Width, bmp.Height);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int bytes = data.Stride * bmp.Height, W = bmp.Width, H = bmp.Height;
      var px = new byte[bytes];
      Marshal.Copy(data.Scan0, px, 0, bytes);
      bool[] allow = null;
      if (seeds != null && seeds.Length > 0) {
        allow = new bool[W * H];
        var q = new System.Collections.Generic.Queue<int>();
        foreach (var sd in seeds) {
          int cx = (int)(sd[0] * W), cy = (int)(sd[1] * H), rad = (int)(0.04 * W);
          for (int y = Math.Max(0, cy - rad); y < Math.Min(H, cy + rad); y++)
            for (int x = Math.Max(0, cx - rad); x < Math.Min(W, cx + rad); x++)
              if (!allow[y * W + x] && Weight(px, y * data.Stride + x * 4) > 0.6) { allow[y * W + x] = true; q.Enqueue(y * W + x); }
        }
        while (q.Count > 0) {
          int k = q.Dequeue(), x0 = k % W, y0 = k / W;
          for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
            int x = x0 + dx, y = y0 + dy;
            if (x < 0 || y < 0 || x >= W || y >= H || allow[y * W + x]) continue;
            if (Weight(px, y * data.Stride + x * 4) > 0.45) { allow[y * W + x] = true; q.Enqueue(y * W + x); }
          }
        }
        // inclui a borda suavizada (2 px) ao redor do que foi preenchido
        for (int pass = 0; pass < 2; pass++) {
          var grow = (bool[])allow.Clone();
          for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++)
            if (!allow[y * W + x] && (allow[y * W + x - 1] || allow[y * W + x + 1] || allow[(y - 1) * W + x] || allow[(y + 1) * W + x])) grow[y * W + x] = true;
          allow = grow;
        }
      }
      for (int y = 0; y < H; y++) {
        for (int x = 0; x < W; x++) {
          int i = y * data.Stride + x * 4;
          if (allow != null && !allow[y * W + x]) continue;
          if (Kept(keep, (double)x / W, (double)y / H)) continue;
          if (regions != null && regions.Length > 0) {
            double fx = (double)x / W, fy = (double)y / H;
            bool inside = false;
            foreach (var r in regions) if (fx >= r[0] && fx <= r[2] && fy >= r[1] && fy <= r[3]) { inside = true; break; }
            if (!inside) continue;
          }
          double w = Weight(px, i);
          if (w <= 0) continue;
          double b = px[i] / 255.0, g = px[i + 1] / 255.0, rr = px[i + 2] / 255.0;
          double max = Math.Max(rr, Math.Max(g, b)), min = Math.Min(rr, Math.Min(g, b)), d = max - min;
          double h = 60 * (((rr - g) / d) + 4);
          double s = d / max, v = max;
          double nh = (h + 112) % 360; // azul (~220) -> rosa (~332)
          double ns = Math.Min(1, s * 0.92), nv = Math.Min(1, v * 1.1 + 0.04);
          double c = nv * ns, hx = nh / 60.0, xx = c * (1 - Math.Abs(hx % 2 - 1)), m = nv - c;
          double r1 = 0, g1 = 0, b1 = 0;
          if (hx < 1) { r1 = c; g1 = xx; } else if (hx < 2) { r1 = xx; g1 = c; } else if (hx < 3) { g1 = c; b1 = xx; }
          else if (hx < 4) { g1 = xx; b1 = c; } else if (hx < 5) { r1 = xx; b1 = c; } else { r1 = c; b1 = xx; }
          r1 += m; g1 += m; b1 += m;
          px[i + 2] = (byte)Math.Round(255 * (rr + (r1 - rr) * w));
          px[i + 1] = (byte)Math.Round(255 * (g + (g1 - g) * w));
          px[i] = (byte)Math.Round(255 * (b + (b1 - b) * w));
        }
      }
      Marshal.Copy(px, 0, data.Scan0, bytes);
      bmp.UnlockBits(data);
      bmp.Save(dst, ImageFormat.Png);
    }
  }
}
'@

$root = Join-Path $PSScriptRoot '..\cuidapet\assets\img'
# Mascotes com azul no corpo ou nos olhos: pontos sobre os óculos, a coleira e o pingente (frações x, y)
$seeds = @{
  'bird-papagaio'  = @(@(0.31, 0.15), @(0.69, 0.17), @(0.35, 0.44), @(0.60, 0.44), @(0.47, 0.53))
}
# Gatos de olhos azuis: a íris fica como está (círculo inteiro preservado)
$keep = @{
  'cat-ragdoll' = @(@(0.46, 0.27, 0.048, 0, 1, 1, 1), @(0.635, 0.265, 0.048, 0, 1, 1, 1))
  'cat-siames'  = @(@(0.33, 0.28, 0.048, 0, 1, 1, 1), @(0.54, 0.28, 0.048, 0, 1, 1, 1))
  'cat-angora'  = @(@(0.47, 0.28, 0.045, 0, 1, 1, 1), @(0.65, 0.28, 0.045, 0, 1, 1, 1))
}
$keep['bird-agapornis'] = @(@(0.51, 0.25, 0.05, 0, 1, 1, 1), @(0.80, 0.135, 0.04, 0, 1, 1, 1))
# O betta é azul no corpo inteiro e o corpo encosta nos acessórios: a versão fêmea fica rosa e vermelha.
$regions = @{
  # Aves com azul no corpo: só óculos e coleira/pingente (x1, y1, x2, y2 em frações)
  'bird-periquito' = @(@(0.40, 0.06, 1.0, 0.34), @(0.50, 0.43, 0.95, 0.64))
  'bird-agapornis' = @(@(0.33, 0.06, 1.0, 0.32), @(0.50, 0.42, 0.95, 0.64))
}

$files = Get-ChildItem -Path $root, (Join-Path $root 'breeds') -Filter *.png | Where-Object { $_.BaseName -notlike '*-f' }
if ($Only.Count) { $files = $files | Where-Object { $Only -contains $_.BaseName } }
foreach ($f in $files) {
  $dst = Join-Path $f.DirectoryName ($f.BaseName + '-f.png')
  $s = if ($seeds.ContainsKey($f.BaseName)) { , [double[][]]$seeds[$f.BaseName] } else { $null }
  $r = if ($regions.ContainsKey($f.BaseName)) { , [double[][]]$regions[$f.BaseName] } else { $null }
  $k = if ($keep.ContainsKey($f.BaseName)) { , [double[][]]$keep[$f.BaseName] } else { $null }
  [Rosa]::Convert($f.FullName, $dst, $s, $r, $k)
  Write-Output "ok  $($f.BaseName)-f.png"
}
