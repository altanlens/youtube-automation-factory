import React from 'react';
import {
	AbsoluteFill,
	Img,
	Sequence,
	Audio,
	staticFile,
	useCurrentFrame,
	interpolate,
} from 'remotion';

// --- Bileşenler ---

const BackgroundImage: React.FC<{
	imageUrl: string | null;
	durationInFrames: number;
}> = ({
	imageUrl,
	durationInFrames
}) => {
	const frame = useCurrentFrame();
	// Görüntünün yumuşak bir şekilde girip çıkması için animasyon
	const opacity = interpolate(
		frame,
		[0, 30, durationInFrames - 30, durationInFrames],
		[0, 1, 1, 0], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	// Eğer görsel bulunamazsa, sadece siyah arka plan göster
	if (!imageUrl) {
		return <AbsoluteFill style = {
			{
				backgroundColor: 'black'
			}
		}
		/>;
	}

	return (
		// Görüntüyü ve üzerindeki karartma efektini uygula
		<AbsoluteFill style = {
			{
				opacity
			}
		} >
		<Img src = {
			imageUrl
		}
		style = {
			{
				width: '100%',
				height: '100%',
				objectFit: 'cover', // Görüntüyü ekrana sığdır
			}
		}
		/>
		{/* Altyazının daha okunaklı olması için görüntüyü hafif karart */}
		<AbsoluteFill style = {
			{
				backgroundColor: 'rgba(0,0,0,0.3)'
			}
		}
		/>
		</AbsoluteFill>
	);
};

const Subtitle: React.FC<{
	text: string;
}> = ({
	text
}) => {
	return (
		<div style = {
			{
				position: 'absolute',
				bottom: '10%',
				width: '100%',
				textAlign: 'center',
				padding: '0 5%',
			}
		} >
		<span style = {
			{
				fontFamily: 'Arial, sans-serif',
				fontSize: '48px',
				color: 'white',
				backgroundColor: 'rgba(0, 0, 0, 0.6)',
				padding: '10px 20px',
				borderRadius: '10px',
				lineHeight: '1.4',
			}
		} > {
			text
		}
		</span>
		</div>
	);
};

// --- Ana Video Kompozisyonu ---

interface SubtitleData {
	text: string;
	start: number;
	duration: number;
	imageUrl: string | null;
}

interface AiVideoProps {
	audioUrl: string;
	subtitles: SubtitleData[];
}

export const AiVideo: React.FC < AiVideoProps > = ({
	audioUrl,
	subtitles
}) => {
	const fps = 30; // Saniyedeki kare sayısı

	return (
		<AbsoluteFill style = {
			{
				backgroundColor: 'black'
			}
		} >
		{ /* Arka Plan Görselleri */ }
		{
			subtitles.map((sub, index) => {
				const startFrame = Math.floor(sub.start * fps);
				const durationInFrames = Math.ceil(sub.duration * fps);
				return (
					<Sequence key = {
						`img-${index}`
					}
					from = {
						startFrame
					}
					durationInFrames = {
						durationInFrames
					} >
					<BackgroundImage imageUrl = {
						sub.imageUrl
					}
					durationInFrames = {
						durationInFrames
					}
					/>
					</Sequence>
				);
			})
		}

		{ /* Altyazılar */ }
		{
			subtitles.map((sub, index) => {
				const startFrame = Math.floor(sub.start * fps);
				const durationInFrames = Math.ceil(sub.duration * fps);
				return (
					<Sequence key = {
						`sub-${index}`
					}
					from = {
						startFrame
					}
					durationInFrames = {
						durationInFrames
					} >
					<Subtitle text = {
						sub.text
					}
					/>
					</Sequence>
				);
			})
		}

		{ /* Ses Dosyası */ }
		<Audio src = {
			staticFile(audioUrl)
		}
		/>
		</AbsoluteFill>
	);
};

