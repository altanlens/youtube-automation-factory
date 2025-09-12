import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Img,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
	Sequence,
	staticFile
} from 'remotion';

interface Scene {
	text: string;
	keyword: string;
	imageUrl: string | null;
	duration: number;
}

interface AIVideoProps {
	script: string;
	audioPath: string;
	scenes: Scene[];
	title: string;
}

export const AIVideo: React.FC<AIVideoProps> = ({
	script,
	audioPath,
	scenes,
	title
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Sahne geçişleri için hesaplamalar
	const sceneDurationInFrames = fps * 3; // Her sahne 3 saniye
	const currentSceneIndex = Math.floor(frame / sceneDurationInFrames);
	const currentScene = scenes[currentSceneIndex] || scenes[0];

	// Animasyon değerleri
	const progress = (frame % sceneDurationInFrames) / sceneDurationInFrames;
	const scale = interpolate(progress, [0, 0.1, 0.9, 1], [1, 1.05, 1.05, 1]);
	const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

	// Spring animasyonu
	const springValue = spring({
		frame: frame % sceneDurationInFrames,
		fps,
		config: {
			damping: 200,
		},
	});

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			{/* Ses dosyası */}
			{audioPath && (
				<Audio
					src={audioPath.startsWith('http') ? audioPath : staticFile(audioPath.replace(/^.*\//, ''))}
					volume={1}
				/>
			)}

			{/* Arka plan görseli */}
			{currentScene?.imageUrl && (
				<AbsoluteFill>
					<Img
						src={currentScene.imageUrl}
						style={{
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							transform: `scale(${scale})`,
							opacity: 0.7,
						}}
					/>
					{/* Overlay */}
					<AbsoluteFill
						style={{
							background: 'linear-gradient(45deg, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
						}}
					/>
				</AbsoluteFill>
			)}

			{/* Başlık */}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					padding: 40,
				}}
			>
				<div
					style={{
						fontSize: 60,
						fontWeight: 'bold',
						color: 'white',
						textAlign: 'center',
						textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
						transform: `translateY(${interpolate(springValue, [0, 1], [50, 0])}px)`,
						opacity: springValue,
						lineHeight: 1.2,
						maxWidth: '80%',
					}}
				>
					{title}
				</div>
			</Sequence>

			{/* Alt başlık/metin */}
			{currentScene?.text && frame > 30 && (
				<AbsoluteFill
					style={{
						justifyContent: 'flex-end',
						alignItems: 'center',
						padding: 60,
					}}
				>
					<div
						style={{
							fontSize: 24,
							color: 'white',
							textAlign: 'center',
							backgroundColor: 'rgba(0,0,0,0.8)',
							padding: '20px 40px',
							borderRadius: 10,
							maxWidth: '80%',
							opacity,
						}}
					>
						{currentScene.text}
					</div>
				</AbsoluteFill>
			)}

			{/* Progress bar */}
			<AbsoluteFill
				style={{
					justifyContent: 'flex-end',
					alignItems: 'flex-start',
					padding: 20,
				}}
			>
				<div
					style={{
						width: '100%',
						height: 4,
						backgroundColor: 'rgba(255,255,255,0.3)',
						borderRadius: 2,
					}}
				>
					<div
						style={{
							width: `${(frame / (scenes.length * sceneDurationInFrames)) * 100}%`,
							height: '100%',
							backgroundColor: '#ff4444',
							borderRadius: 2,
							transition: 'width 0.3s ease',
						}}
					/>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};