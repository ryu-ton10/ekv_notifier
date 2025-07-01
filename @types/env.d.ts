declare module 'process' {
	global {
		namespace NodeJS {
			interface ProcessEnv {
				readonly TOKEN?: string;
				readonly GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;
				readonly GOOGLE_PRIVATE_KEY?: string;
				readonly SPREADSHEET_ID?: string;
				readonly MEMBER_LIST_WORKSHEET_ID?: number;
				readonly MEMBER_MASTER_WORKSHEET_ID?: number;
				readonly GAME_MASTER_WORKSHEET_ID?: number;
				readonly CHANNEL_ID?: string;
				readonly CLIENT_ID?: number;
				readonly GUILD_ID?: number;
				readonly IS_LOCAL?: boolean;
			}
		}
	}
}
export {}