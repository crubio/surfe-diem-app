# QR Code Generator

A web-based tool for generating professional QR codes for Surfe Diem surf spots.

## Features

- **Dynamic Spot Loading**: Automatically fetches all spots from the Surfe Diem API
- **Search & Filter**: Find spots by name or region
- **Professional Design**: Clean, branded QR codes with spot names
- **Download Ready**: PNG format perfect for stickers and printing

## Usage

1. Open `qr-code-generator.html` in any modern web browser
2. Search for a surf spot using the search box
3. Select the desired spot from the dropdown
4. Click "Generate QR Code" to create the QR code
5. Click "Download Image" to save as PNG

## Output

The generated QR codes include:
- Surfe Diem branding
- Spot name as header
- QR code linking to the spot page
- Professional styling for marketing use

## Perfect For

- **Local Marketing**: Surf shops, coffee shops, beach access points
- **Community Events**: Surf competitions, meetups, camps
- **Word of Mouth**: Easy sharing with friends and local surfers
- **Physical Distribution**: Stickers, posters, business cards

## Technical Details

- Uses QRCode.js library for QR code generation
- Fetches spot data from `https://api.surfe-diem.com/api/v1/spots`
- Generates URLs in format: `https://surfe-diem.com/spot/{id}`
- Output: 200x200px QR codes with custom styling 