Add-Type -AssemblyName System.Drawing

# Compose the Cityhotel photos into the scanned polaroid frames.
# The frames have a transparent window; the photo is center-cropped to the
# window aspect and drawn underneath, the frame on top. Alpha is preserved.

$pairs = @(
  @{ frame = 'polaroid-frame-sketch2.png';      photo = 'Cityhotel_Sketch.jpg';      out = 'polaroid-composed-sketch.png' },
  @{ frame = 'polaroid-frame-concrete2.png';     photo = 'Cityhotel_Concrete.jpg';    out = 'polaroid-composed-concrete.png' },
  @{ frame = 'polaroid-frame-scandi2.png';       photo = 'Cityhotel_Scandi.jpg';      out = 'polaroid-composed-scandi.png' },
  @{ frame = 'polaroid-frame-bladerunner2.png';  photo = 'Cityhotel_Blade-Runner.jpg'; out = 'polaroid-composed-bladerunner.png' }
)
$dir = 'C:\Users\timmo\portfolio\public\master-thesis'

function Get-Window($bmp) {
  $W = $bmp.Width; $H = $bmp.Height
  $midY = [int]($H * 0.4); $midX = [int]($W * 0.5)
  $l = -1; for ($x = 0; $x -lt $W; $x++) { if ($bmp.GetPixel($x, $midY).A -lt 20) { $l = $x; break } }
  $r = -1; $seen = $false
  for ($x = $W-1; $x -ge 0; $x--) {
    $a = $bmp.GetPixel($x, $midY).A
    if ($a -ge 20) { $seen = $true } elseif ($seen) { $r = $x; break }
  }
  $t = -1; for ($y = 0; $y -lt $H; $y++) { if ($bmp.GetPixel($midX, $y).A -lt 20) { $t = $y; break } }
  $b = -1; $seen2 = $false
  for ($y = $H-1; $y -ge 0; $y--) {
    $a = $bmp.GetPixel($midX, $y).A
    if ($a -ge 20) { $seen2 = $true } elseif ($seen2) { $b = $y; break }
  }
  @{ L = $l; T = $t; W = ($r - $l + 1); H = ($b - $t + 1) }
}

foreach ($p in $pairs) {
  $frameImg = [System.Drawing.Image]::FromFile("$dir\$($p.frame)")
  $photoImg = [System.Drawing.Image]::FromFile("$dir\$($p.photo)")
  $frameBmp = New-Object System.Drawing.Bitmap($frameImg)
  $win = Get-Window $frameBmp
  Write-Output ("{0}: window {1}x{2} at {3},{4}" -f $p.frame, $win.W, $win.H, $win.L, $win.T)

  $outBmp = New-Object System.Drawing.Bitmap($frameImg.Width, $frameImg.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($outBmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  # center-crop the photo to the window aspect, then draw it into the window
  $winAspect = $win.W / $win.H
  $srcW = [double]$photoImg.Width; $srcH = [double]$photoImg.Height
  if ($srcW / $srcH -gt $winAspect) {
    $cropW = $srcH * $winAspect; $cropH = $srcH
  } else {
    $cropW = $srcW; $cropH = $srcW / $winAspect
  }
  $srcX = ($srcW - $cropW) / 2; $srcY = ($srcH - $cropH) / 2
  $destRectF = New-Object System.Drawing.RectangleF([single]$win.L, [single]$win.T, [single]$win.W, [single]$win.H)
  $srcRectF = New-Object System.Drawing.RectangleF([single]$srcX, [single]$srcY, [single]$cropW, [single]$cropH)
  $g.DrawImage($photoImg, $destRectF, $srcRectF, [System.Drawing.GraphicsUnit]::Pixel)

  # frame on top
  $g.DrawImage($frameBmp, (New-Object System.Drawing.Rectangle(0, 0, $frameImg.Width, $frameImg.Height)), (New-Object System.Drawing.Rectangle(0, 0, $frameImg.Width, $frameImg.Height)), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()

  $outBmp.Save("$dir\$($p.out)", [System.Drawing.Imaging.ImageFormat]::Png)
  $outBmp.Dispose(); $frameBmp.Dispose(); $frameImg.Dispose(); $photoImg.Dispose()
  Write-Output ("  -> " + $p.out)
}
Write-Output "done"
