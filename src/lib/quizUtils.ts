import { supabase } from './supabaseClient';

export async function clearDuplicateQuizPlays(userId: string) {
  try {
    // Get all quiz plays for the user
    const { data: allPlays, error: fetchError } = await supabase
      .from('quiz_plays')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    if (fetchError) throw fetchError;

    if (!allPlays || allPlays.length === 0) return;

    // Group plays by quiz_id, score, total_questions, correct_answers
    const groupedPlays = allPlays.reduce((acc, play) => {
      const key = `${play.quiz_id}-${play.score}-${play.total_questions}-${play.correct_answers}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(play);
      return acc;
    }, {} as Record<string, typeof allPlays>);

    // Find duplicates and keep only the first one
    const duplicatesToDelete: string[] = [];
    
    (Object.values(groupedPlays) as typeof allPlays[]).forEach((group: typeof allPlays) => {
      if (group.length > 1) {
        // Keep the first one (most recent), delete the rest
        const toKeep = group[0];
        const toDelete = group.slice(1);
        duplicatesToDelete.push(...toDelete.map(play => play.id));
      }
    });

    // Delete duplicates
    if (duplicatesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('quiz_plays')
        .delete()
        .in('id', duplicatesToDelete);

      if (deleteError) throw deleteError;
      
      console.log(`Cleared ${duplicatesToDelete.length} duplicate quiz plays`);
    }

  } catch (error) {
    console.error('Error clearing duplicate quiz plays:', error);
  }
}

export async function getUniqueQuizPlays(userId: string, limit: number = 5) {
  try {
    // Get unique quiz plays (latest play per quiz)
    const { data: plays, error } = await supabase
      .from('quiz_plays')
      .select(`
        quiz_id,
        score,
        correct_answers,
        total_questions,
        played_at,
        quiz!inner(title)
      `)
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(limit * 2); // Get more to filter duplicates

    if (error) throw error;

    // Filter to get only the latest play per quiz
    const uniquePlays = plays?.reduce((acc, play) => {
      if (!acc.find(p => p.quiz_id === play.quiz_id)) {
        acc.push(play);
      }
      return acc;
    }, [] as typeof plays) || [];

    return uniquePlays.slice(0, limit);
  } catch (error) {
    console.error('Error getting unique quiz plays:', error);
    return [];
  }
}
