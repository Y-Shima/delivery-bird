#!/usr/bin/env python3
"""
SVGファイルをPNGに変換するスクリプト
"""

import os
import sys
from pathlib import Path
import cairosvg
from PIL import Image
import io

def svg_to_png(svg_path, png_path, size=32):
    """SVGファイルをPNGに変換"""
    try:
        # SVGをPNGに変換
        png_data = cairosvg.svg2png(
            url=str(svg_path),
            output_width=size,
            output_height=size
        )
        
        # PILで画像を開いて保存
        image = Image.open(io.BytesIO(png_data))
        image.save(png_path, 'PNG')
        print(f"✅ 変換完了: {svg_path} -> {png_path}")
        
    except Exception as e:
        print(f"❌ 変換エラー: {svg_path} - {e}")

def convert_all_svgs(svg_dir, png_dir, size=32):
    """指定ディレクトリ内のすべてのSVGファイルを変換"""
    svg_dir = Path(svg_dir)
    png_dir = Path(png_dir)
    
    # 出力ディレクトリを作成
    png_dir.mkdir(parents=True, exist_ok=True)
    
    # SVGファイルを検索して変換
    svg_files = list(svg_dir.glob('*.svg'))
    if not svg_files:
        print(f"⚠️  SVGファイルが見つかりません: {svg_dir}")
        return
    
    for svg_file in svg_files:
        png_file = png_dir / f"{svg_file.stem}.png"
        svg_to_png(svg_file, png_file, size)

def create_favicon(svg_path, ico_path):
    """SVGからfavicon.icoを作成"""
    try:
        # 複数サイズのPNGを作成
        sizes = [16, 32, 48, 64]
        images = []
        
        for size in sizes:
            png_data = cairosvg.svg2png(
                url=str(svg_path),
                output_width=size,
                output_height=size
            )
            image = Image.open(io.BytesIO(png_data))
            images.append(image)
        
        # ICOファイルとして保存
        images[0].save(
            ico_path,
            format='ICO',
            sizes=[(img.width, img.height) for img in images],
            append_images=images[1:]
        )
        print(f"✅ favicon作成完了: {svg_path} -> {ico_path}")
        
    except Exception as e:
        print(f"❌ favicon作成エラー: {svg_path} - {e}")

if __name__ == "__main__":
    # プロジェクトルートディレクトリ
    project_root = Path(__file__).parent.parent
    svg_dir = project_root / "images" / "svg"
    png_dir = project_root / "images" / "sprites"
    
    print("🎨 SVG to PNG 変換開始...")
    
    # スプライト変換
    convert_all_svgs(svg_dir, png_dir, 32)
    
    # favicon作成
    favicon_svg = svg_dir / "meimei.svg"
    if favicon_svg.exists():
        favicon_ico = project_root / "favicon.ico"
        create_favicon(favicon_svg, favicon_ico)
    
    print("🎉 変換処理完了！")
