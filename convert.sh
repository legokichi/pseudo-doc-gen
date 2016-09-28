find TRACK_I_Modern_Dataset -name *.tif -exec convert {} {}.png \;
find TRACK_I_Modern_Dataset -name "*.png" -exec mv {} ./htdocs/handwriting \;
find htdocs/chars -name "*.tif.png" -exec mv {} ./htdocs/handwriting \;
