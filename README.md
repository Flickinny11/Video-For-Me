# Video For Me - AI Video & Image Generator

A React Native/Expo app for generating AI videos and images using Fal.ai's Wan 2.6 models. Built specifically for iPhone deployment.

## Features

### AI Generation Models
- **Text to Video** - Generate videos from text prompts (5, 10, or 15 seconds)
- **Image to Video** - Animate images with AI-generated motion
- **Reference to Video** - Create videos with subject consistency from reference videos
- **Text to Image** - Generate images from text descriptions
- **Image to Image** - Transform images with text prompts

### Video Sequencing
- Generate up to 5 sequential videos
- Each segment can have its own prompt and duration
- Seamless transitions using the last frame of previous videos
- Automatic frame extraction and upscaling for consistency

### Library Management
- View all generated content in a gallery
- Play videos directly in the app
- Download to photo library
- Reuse prompts and images for new generations
- Favorite and organize creations

### Smart Image Processing
- Automatic resizing for Wan 2.6 requirements (360-2000px)
- Format conversion (JPEG, PNG, BMP, WEBP support)
- File size optimization (max 25MB)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Fal.ai API key
- Apple Developer account (for iOS builds)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Video-For-Me.git
cd Video-For-Me
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open in Expo Go on your iPhone by scanning the QR code.

### Configuration

1. Get a Fal.ai API key from [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
2. Open the app and go to Settings
3. Enter your API key and save

## Building for iPhone

### Option 1: EAS Build (Recommended - No Mac Required)

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Update `app.json` with your bundle identifier and `eas.json` with your project ID.

5. Build for iOS:
```bash
# For internal testing (ad-hoc distribution)
npm run build:ios:preview

# For App Store
npm run build:ios:prod
```

6. Submit to TestFlight:
```bash
npm run submit:ios
```

### Option 2: GitHub Actions

1. Set up these secrets in your GitHub repository:
   - `EXPO_TOKEN` - Your Expo access token
   - `EXPO_APPLE_ID` - Your Apple ID email
   - `EXPO_ASC_API_KEY_ID` - App Store Connect API Key ID
   - `EXPO_ASC_API_KEY_ISSUER_ID` - API Key Issuer ID
   - `EXPO_ASC_API_KEY_PATH` - Path to your .p8 key file

2. Push to main branch or manually trigger the workflow.

3. Download the build from Expo or TestFlight.

### Installing on iPhone via TestFlight

1. After the build completes, go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app's TestFlight section
3. Add yourself as an internal tester
4. Install TestFlight from the App Store on your iPhone
5. Open TestFlight and install Video For Me

## API Reference

This app uses Fal.ai's Wan 2.6 API endpoints:

| Model | Endpoint | Description |
|-------|----------|-------------|
| Text to Video | `wan/v2.6/text-to-video` | Generate video from text |
| Image to Video | `wan/v2.6/image-to-video` | Animate an image |
| Reference to Video | `wan/v2.6/reference-to-video` | Subject-consistent video |
| Text to Image | `wan/v2.6/text-to-image` | Generate image from text |
| Image to Image | `wan/v2.6/image-to-image` | Transform an image |
| Upscale | `fal-ai/esrgan` | Upscale images |

### Key Parameters

- **Resolution**: 720p or 1080p
- **Duration**: 5, 10, or 15 seconds (Reference to Video: 5 or 10 only)
- **Aspect Ratio**: 16:9, 9:16, 1:1, 4:3, 3:4
- **Safety Checker**: Disabled by default (configurable)
- **Prompt Expansion**: AI-enhanced prompts (enabled by default)

## Project Structure

```
Video-For-Me/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Tab navigation layout
│   ├── index.tsx           # Generate screen
│   ├── status.tsx          # Job status screen
│   ├── library.tsx         # Library/gallery screen
│   └── settings.tsx        # Settings screen
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/           # API services
│   │   └── falApi.ts       # Fal.ai integration
│   ├── store/              # Zustand state management
│   │   └── useAppStore.ts  # Global app state
│   ├── types/              # TypeScript definitions
│   └── utils/              # Helper functions
│       ├── imageUtils.ts   # Image processing
│       └── videoUtils.ts   # Video/frame extraction
├── app.json                # Expo configuration
├── eas.json                # EAS Build configuration
└── package.json
```

## Tips for Best Results

### Prompts
- Be descriptive but concise (max 800-1000 characters)
- Describe motion for video generation
- Use negative prompts to avoid unwanted elements

### Reference to Video
- Use `@Video1`, `@Video2`, `@Video3` to reference subjects
- Provide clear, well-lit reference videos
- Specify spatial relationships in your prompt

### Video Sequences
- Plan transitions between segments
- Use consistent subjects across prompts
- Keep individual segments shorter for better quality

## Troubleshooting

### Build Errors
- Ensure your Apple Developer account is active
- Check that bundle identifier is unique
- Verify EAS credentials are correct

### Generation Failures
- Verify API key is valid
- Check image dimensions (360-2000px)
- Ensure file sizes are under 25MB

### Video Playback Issues
- Wait for video to fully load
- Check internet connection
- Try downloading locally first

## License

MIT License - See LICENSE file for details.

## Acknowledgments

- [Fal.ai](https://fal.ai) for the Wan 2.6 AI models
- [Expo](https://expo.dev) for the React Native framework
- [Zustand](https://github.com/pmndrs/zustand) for state management
