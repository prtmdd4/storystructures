/* Shared insert into ss_ai_stories. Best-effort — a save failure must never
   block a kid from playing the story they just generated. */

export async function persistStory(supabase, { deviceId, theme, story }) {
  if (!supabase) return { saved: false, reason: 'no_supabase' };
  try {
    const { error } = await supabase.from('ss_ai_stories').insert({
      story_key: story.id,
      device_id: deviceId,
      theme,
      title:     story.title,
      parts:     story.parts,
      quiz:      story.quiz,
      level:     story.level,
      audio:     story.audio || {},
    });
    if (error && error.code !== '23505') { // 23505 = duplicate story_key, harmless
      console.error('persistStory insert error:', error);
      return { saved: false, reason: 'db_error' };
    }
    return { saved: true };
  } catch (err) {
    console.error('persistStory failed:', err.message);
    return { saved: false, reason: 'exception' };
  }
}
