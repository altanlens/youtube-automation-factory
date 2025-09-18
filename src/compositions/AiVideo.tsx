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

interface Subtitle {
	text: string;
	start: number;
	duration: number;
	imageUrl: string | null;
}

interface AIVideoProps {
	audioUrl?: string;
	subtitles?: Subtitle[];
}

export const AIVideo: React.FC<AIVideoProps> = ({
	audioUrl,
	subtitles = []
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Mevcut zamanı hesapla (saniye cinsinden)
	const currentTime = frame / fps;

	// Aktif altyazıyı bul
	const currentSubtitle = subtitles.find(subtitle =>
		currentTime >= subtitle.start && currentTime < subtitle.start + subtitle.duration
	);

	// Animasyon değerleri
	const scale = currentSubtitle ? interpolate(
		currentTime,
		[currentSubtitle.start, currentSubtitle.start + 0.3, currentSubtitle.start + currentSubtitle.duration - 0.3, currentSubtitle.start + currentSubtitle.duration],
		[1, 1.05, 1.05, 1]
	) : 1;

	const opacity = currentSubtitle ? interpolate(
		currentTime,
		[currentSubtitle.start, currentSubtitle.start + 0.3, currentSubtitle.start + currentSubtitle.duration - 0.3, currentSubtitle.start + currentSubtitle.duration],
		[0, 1, 1, 0]
	) : 0;

	// Spring animasyonu
	const springValue = spring({
		frame: frame,
		fps,
		config: {
			damping: 200,
		},
	});

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			{/* Ses dosyası */}
			{audioUrl && (
				<Audio
					src={audioUrl.startsWith('http') ? audioUrl : staticFile(audioUrl.replace(/^.*\//, ''))}
					volume={1}
				/>
			)}

			{/* Arka plan görseli */}
			{currentSubtitle?.imageUrl && (
				<AbsoluteFill>
					<Img
						src={currentSubtitle.imageUrl}
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

			{/* Altyazı metni */}
			{currentSubtitle && (
				<AbsoluteFill
					style={{
						justifyContent: 'flex-end',
						alignItems: 'center',
						padding: 60,
					}}
				>
					<div
						style={{
							fontSize: 32,
							color: 'white',
							textAlign: 'center',
							backgroundColor: 'rgba(0,0,0,0.8)',
							padding: '20px 40px',
							borderRadius: 10,
							maxWidth: '90%',
							opacity,
							textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
							lineHeight: 1.4,
						}}
					>
						{currentSubtitle.text}
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
							width: `${subtitles.length > 0 ? (currentTime / (subtitles[subtitles.length - 1].start + subtitles[subtitles.length - 1].duration)) * 100 : 0}%`,
							height: '100%',
							backgroundColor: '#ff4444',
							borderRadius: 2,
						}}
					/>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};