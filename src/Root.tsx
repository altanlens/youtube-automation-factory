import React from 'react';
import {Composition} from 'remotion';
import {HelloWorld} from './compositions/HelloWorld';
import {AiVideo, AiVideoProps} from './compositions/AiVideo'; // Yeni kompozisyonu import et
import './style.css';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					titleText: 'Welcome to Remotion',
					titleColor: 'rgb(0, 123, 255)',
				}}
			/>
			{/* Yeni AI Video Kompozisyonu eklendi */}
			<Composition
				id="AiVideo"
				component={AiVideo}
				durationInFrames={900} // Varsayılan süre (30 saniye)
				fps={30}
				width={1920}
				height={1080}
				// Varsayılan prop'lar, render sırasında üzerine yazılacak
				defaultProps={{
					audioUrl: '',
					subtitles: [
						{
							text: 'Bu bir test altyazısıdır.',
							start: 1,
							duration: 3,
						},
					],
				}}
			/>
		</>
	);
};
