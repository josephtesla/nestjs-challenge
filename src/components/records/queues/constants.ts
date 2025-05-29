export const TracklistQueueName = 'tracklist-queue';
export const GetRecordTracklistJob = 'get-record-tracklist';
export const TracklistQueueJobOptions = {
  removeOnComplete: true,
  removeOnFail: true,
  timeout: 30000,
};

// adding rate limit for controlled processing
// so we can handle musicbrainz api rate limits contraints of 1req/sec
export const TracklistQueueLimiter = {
  max: 1, // max 1 job in a 1s window
  duration: 1000,
};
