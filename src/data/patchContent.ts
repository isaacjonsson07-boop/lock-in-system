// ============================================
// STRUCTURED ACHIEVEMENT — System Patch Content
// Weekly post-installation lessons
// ============================================

export interface PatchSection {
  heading: string;
  paragraphs: string[];
}

export interface SystemPatchData {
  id: string;
  week: number;
  title: string;
  subtitle: string;
  sections: PatchSection[];
  configTask: {
    title: string;
    description: string;
  };
}

export const PATCH_DATA: SystemPatchData[] = [
  {
    id: 'patch-001',
    week: 1,
    title: 'Operational Drift',
    subtitle: 'The system is installed. The risk now is not failure — it\u2019s gradual erosion.',
    sections: [
      {
        heading: 'The concept',
        paragraphs: [
          'Operational drift is the slow, invisible decay of a system that was once sharp. It doesn\u2019t happen in a single missed day. It happens when you complete your habits mechanically instead of intentionally. When your task list becomes a copy of yesterday\u2019s. When your non-negotiables start feeling optional. The system still looks operational from the outside, but the edge is gone.',
          'Drift is dangerous precisely because it\u2019s comfortable. You\u2019re still showing up. You\u2019re still checking boxes. But the gap between executing your system and just going through motions widens by a fraction every day \u2014 until the system is running you instead of the other way around.',
        ],
      },
      {
        heading: 'Application',
        paragraphs: [
          'This week, audit your execution for autopilot. Before completing each habit and task, pause for two seconds and answer internally: <strong>why is this on my list?</strong> If you can\u2019t connect it to your operating direction in one sentence, flag it. Not everything flagged needs to be removed \u2014 but everything should be intentional.',
        ],
      },
    ],
    configTask: {
      title: 'Audit for autopilot',
      description: 'Open your habit stack and task list. Mark any item you\u2019ve been completing on autopilot without conscious intent. For each one, either reaffirm its connection to your direction or replace it with something more aligned.',
    },
  },
  {
    id: 'patch-002',
    week: 2,
    title: 'Friction Mapping',
    subtitle: 'Every system has friction points. The operators who improve fastest are the ones who find them first.',
    sections: [
      {
        heading: 'The concept',
        paragraphs: [
          'Friction is any point in your daily system where execution slows, stalls, or requires willpower it shouldn\u2019t. It might be a habit scheduled at the wrong time. A task that\u2019s too vague to act on. A non-negotiable that depends on conditions you can\u2019t control. Friction doesn\u2019t announce itself \u2014 it just makes your system slightly harder to run every day. Over time, friction compounds into resistance, and resistance becomes the reason people quit systems that were working.',
          'The instinct is to push through friction with discipline. That works short-term. But the structural fix is better: identify the friction, then redesign around it. Don\u2019t fight your system \u2014 refine it.',
        ],
      },
      {
        heading: 'Application',
        paragraphs: [
          'Track your execution this week with one added layer of awareness: notice when you hesitate. Not when you skip something \u2014 when you <strong>hesitate</strong> before starting it. Hesitation is the signal. It means something about the task, habit, or timing is creating unnecessary resistance.',
        ],
      },
    ],
    configTask: {
      title: 'Identify your top 3 friction points',
      description: 'By the end of this week, identify the 3 moments in your daily system where execution drags. For each one, write a one-line structural fix. Examples: move the habit to a different time, break the vague task into a specific first step, add a trigger that removes a decision.',
    },
  },
  {
    id: 'patch-003',
    week: 3,
    title: 'The Minimum Viable Day',
    subtitle: 'You will have days where the full system feels impossible. The question is whether you have a protocol for those days.',
    sections: [
      {
        heading: 'The concept',
        paragraphs: [
          'Every operating system needs a fallback mode. Your full daily system \u2014 all habits, all tasks, all non-negotiables \u2014 is your standard operating configuration. But some days, circumstances make full execution unrealistic. Illness, travel, crisis, exhaustion. On those days, most people either force the full system and burn out, or abandon it entirely and lose momentum. Both responses damage the system.',
          'The solution is a pre-defined Minimum Viable Day: the smallest version of your system that still counts as operational. Not a free pass \u2014 a structural downgrade that preserves the streak, maintains identity alignment, and prevents the \u201CI already missed today, so why bother\u201D spiral.',
        ],
      },
      {
        heading: 'Application',
        paragraphs: [
          'Your MVD should contain exactly 3 elements: your single most important non-negotiable, one task (your highest-leverage item), and a 2-minute version of your most critical habit. That\u2019s it. On a hard day, you execute only these three. The system stays alive. The streak holds.',
        ],
      },
    ],
    configTask: {
      title: 'Define your Minimum Viable Day',
      description: 'Write down the 3 elements of your MVD right now. Store it somewhere you\u2019ll see it when you need it \u2014 a note on your phone, a card in your system documents. The time to design a fallback is before you need it, not during the crisis.',
    },
  },
  {
    id: 'patch-004',
    week: 4,
    title: 'Reading Your Data',
    subtitle: 'Your first System Report is here. The numbers tell a story \u2014 but only if you know how to read it.',
    sections: [
      {
        heading: 'The concept',
        paragraphs: [
          'Data without interpretation is just decoration. Your monthly System Report shows your habits percentage, task completion rate, non-negotiable consistency, streak length, and overall score. But the score alone doesn\u2019t tell you what to do next. A 92 and an 85 could mean completely different things depending on where the points were lost.',
          'The skill is pattern recognition. Where did execution break? Was it a specific category (habits strong, tasks weak)? A specific time period (strong start, faded end)? A specific trigger (weekends, travel days, high-stress periods)? The report gives you the <strong>what</strong>. Your job is to find the <strong>why</strong> \u2014 and then reconfigure.',
        ],
      },
      {
        heading: 'Application',
        paragraphs: [
          'Look at your System Report and identify the single weakest category. Don\u2019t try to fix everything. Find the one area with the lowest score and ask: what specifically caused this? Was it a structural problem (bad scheduling, unclear tasks) or an execution problem (you knew what to do but didn\u2019t)? Structural problems need system redesign. Execution problems need accountability adjustment.',
        ],
      },
    ],
    configTask: {
      title: 'Write one reconfiguration',
      description: 'Based on your report, write one specific structural change. Not \u201Cdo better at tasks\u201D \u2014 that\u2019s not structural. Something like: \u201CMove my task planning from morning to the night before, so I wake up with a clear list instead of deciding under pressure.\u201D One change. Make it concrete. Implement it this week.',
    },
  },
];

export function getPatchByWeek(week: number): SystemPatchData | undefined {
  return PATCH_DATA.find(p => p.week === week);
}
