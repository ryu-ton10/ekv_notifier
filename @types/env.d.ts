declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				readonly TOKEN?: string;
			}
		}
	}
}
export {}