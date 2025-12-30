const recordingGuilds = new Set<string>();

export const startRecording = (guildId: string) => recordingGuilds.add(guildId);
export const stopRecording = (guildId: string) => recordingGuilds.delete(guildId);
export const isRecording = (guildId?: string) => !!guildId && recordingGuilds.has(guildId);
export const listRecordingGuilds = () => Array.from(recordingGuilds); // for debug