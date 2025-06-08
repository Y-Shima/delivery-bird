#!/usr/bin/env python3
"""
64x64サイズのSVGファイルをPNGに変換するスクリプト
"""

import os
import sys
from pathlib import Path
import cairosvg
from PIL import Image
import io

def svg_to_png_64(svg_path, png_path, size=64):
    """SVGファイルを64x64のPNGに変換"""
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

def convert_64x64_sprites():
    """64x64スプライト専用の変換"""
    project_root = Path(__file__).parent.parent
    svg_dir = project_root / "images" / "svg"
    png_dir = project_root / "images" / "sprites"
    
    # 出力ディレクトリを作成
    png_dir.mkdir(parents=True, exist_ok=True)
    
    # 64x64スプライトファイルのリスト
    sprite_files = [
        "meimei-64.svg",
        "meimei-fly1-64.svg", 
        "meimei-fly2-64.svg",
        "meimei-powerup-64.svg",
        "meimei-stunned-64.svg",
        "enemy-blue-64.svg",
        "enemy-red-64.svg",
        "enemy-yellow-64.svg"
    ]
    
    print("🎨 64x64 SVG to PNG 変換開始...")
    
    for svg_filename in sprite_files:
        svg_path = svg_dir / svg_filename
        if svg_path.exists():
            # 出力ファイル名から-64を削除
            png_filename = svg_filename.replace("-64.svg", ".png")
            png_path = png_dir / png_filename
            svg_to_png_64(svg_path, png_path, 64)
        else:
            print(f"⚠️  ファイルが見つかりません: {svg_path}")
    
    # favicon作成（メイメイから）
    favicon_svg = svg_dir / "meimei-64.svg"
    if favicon_svg.exists():
        favicon_ico = project_root / "favicon.ico"
        create_favicon_64(favicon_svg, favicon_ico)
    
    print("🎉 64x64変換処理完了！")

def create_favicon_64(svg_path, ico_path):
    """64x64 SVGからfavicon.icoを作成"""
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
    convert_64x64_sprites()
