param(
  [Parameter(Mandatory=$true)][string]$Source,
  [Parameter(Mandatory=$true)][string[]]$Names
)

Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System; using System.Drawing; using System.Drawing.Imaging; using System.Drawing.Drawing2D; using System.Runtime.InteropServices;
public static class BreedSheet {
  static double Ramp(double x,double a,double b){return x<=a?0:x>=b?1:(x-a)/(b-a);}
  public static void Crop(string src,string dst,int col,int row) {
    using(var input=new Bitmap(src)) using(var tile=input.Clone(new Rectangle(col*(input.Width/5),row*(input.Height/3),input.Width/5,input.Height/3),PixelFormat.Format32bppArgb)) {
      int w=tile.Width,h=tile.Height;var d=tile.LockBits(new Rectangle(0,0,w,h),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[d.Stride*h];Marshal.Copy(d.Scan0,px,0,px.Length);int x0=w,y0=h,x1=0,y1=0;
      for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*d.Stride+x*4;double b=px[i],g=px[i+1],r=px[i+2],key=(Math.Min(r,b)-g)/255.0,a=1-Ramp(key,.12,.42);if(key>0){double spill=Math.Min(r,b)-g;r-=spill;b-=spill;}px[i]=(byte)Math.Max(0,Math.Min(255,b));px[i+2]=(byte)Math.Max(0,Math.Min(255,r));px[i+3]=(byte)(px[i+3]*a);if(a>.5){x0=Math.Min(x0,x);x1=Math.Max(x1,x);y0=Math.Min(y0,y);y1=Math.Max(y1,y);}}
      Marshal.Copy(px,0,d.Scan0,px.Length);tile.UnlockBits(d);using(var output=new Bitmap(800,800,PixelFormat.Format32bppArgb))using(var g=Graphics.FromImage(output)){g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;int side=Math.Max(x1-x0+1,y1-y0+1);double scale=780.0/side;int dw=(int)((x1-x0+1)*scale),dh=(int)((y1-y0+1)*scale);g.DrawImage(tile,new Rectangle((800-dw)/2,800-dh-8,dw,dh),new Rectangle(x0,y0,x1-x0+1,y1-y0+1),GraphicsUnit.Pixel);output.Save(dst,ImageFormat.Png);}
    }
  }
}
'@

$root = Join-Path $PSScriptRoot '..\cuidapet\assets\img\breeds'
for ($i=0; $i -lt $Names.Count; $i++) {
  $path = Join-Path $root ($Names[$i] + '.png')
  [BreedSheet]::Crop((Resolve-Path $Source).Path, $path, $i % 5, [Math]::Floor($i / 5))
}
& (Join-Path $PSScriptRoot 'rosa.ps1') -Only $Names
