export interface PainArea {
  label: string;
  why: string;
  fix: string[];
  doctor: string;
  sources: string[];
}

type StageBase = Omit<MomStage, 'dad'>;

export interface MomStage {
  title: string;
  from: number; // first baby week of this stage
  focus: string;
  areas: string[]; // keys of painAreas
  stageTip: string; // extra pain tip for this stage
  exercise: string[];
  mind: string[];
  doctor: string[];
  dad: string[];
  sources: string[];
}

// Content researched from NHS, CDC, WHO, NIMH, PSI, BJSM and others. General tips only, not medical advice.
const painAreasData: Record<string, PainArea> = {
  back: {
    label: 'Lower back',
    why: 'Lifting, carrying and leaning over the baby strain the back.',
    fix: [
      'Bring the baby up to you with a pillow. Do not lean down to the baby.',
      'Bend your knees and keep the baby close when you lift. Do not twist while you hold the baby.',
      'Cat-cow: on hands and knees, round then arch your back slowly. Do 8 to 10 reps, a few times a day.',
    ],
    doctor: 'See a doctor fast for back pain with fever, numbness in legs or groin, trouble passing urine or stool, leg weakness, or pain that is severe or keeps getting worse.',
    sources: [
      'https://www.hingehealth.com/gb/en/resources/articles/breastfeeding-positions-reduce-pain/',
      'https://feminapt.com/resources/published-articles/help-for-postural-pain-after-breastfeeding',
      'https://www.healthline.com/health/diastasis-recti',
      'https://www.nct.org.uk/labour-birth/you-after-birth/episiotomy-care-and-recovery',
    ],
  },
  neck: {
    label: 'Neck and shoulders',
    why: 'Looking down at the baby makes your head drop forward and your shoulders round.',
    fix: [
      'Use pillows to lift the baby to breast height so your head, neck and shoulders stay relaxed.',
      'Chest opener: clasp hands behind you, pull shoulders down and back, lift arms. Hold 15 seconds, 3 times, after each feed.',
      'Neck stretch: tilt ear to shoulder, then turn the chin down toward the armpit. Hold 30 seconds, 2 times each side, 2 or more times a day.',
    ],
    doctor: 'See a doctor for neck pain with arm numbness or weakness, severe headache, fever, pain after a fall, or pain that does not improve after 2 weeks.',
    sources: [
      'https://feminapt.com/resources/published-articles/help-for-postural-pain-after-breastfeeding',
      'https://www.hingehealth.com/gb/en/resources/articles/breastfeeding-positions-reduce-pain/',
      'https://clinicaltrials.gov/study/NCT07037056',
    ],
  },
  wrist: {
    label: 'Wrist and thumb',
    why: 'Lifting the baby and holding the head with the thumb out strains the thumb side of the wrist.',
    fix: [
      'Lift the baby with both hands under the body. Keep your wrists straight and your palms open.',
      'Rest the baby on a pillow when feeding so your wrist and thumb do not carry the weight.',
      'Use a cold pack for 10 minutes after use if the thumb is swollen. Warmth before gentle moves can ease stiffness.',
    ],
    doctor: 'See a doctor if thumb or wrist pain lasts more than 2 weeks, gets worse, or comes with swelling, a hot red joint, fever, numbness, or you cannot move the thumb.',
    sources: [
      'https://policyonline.nhslothian.scot/wp-content/uploads/2023/03/De_Quervains_Tenosynovitis.pdf',
      'https://mydoctor.kaiserpermanente.org/ncal/Images/Dequervains%20tenosynovitis_012701-010%20(12-14)%20ADA_tcm75-1235338.pdf',
    ],
  },
  breast: {
    label: 'Breast and nipples',
    why: 'Sore nipples are most often linked to a shallow latch or poor position.',
    fix: [
      'Get a midwife, lactation consultant or breastfeeding helper to watch a full feed. Small changes often fix pain fast.',
      'Bring baby to the breast, tummy to tummy. Aim the nipple at the nose so baby opens wide and takes a deep mouthful.',
      'Use a warm cloth before feeds. Use a cool cloth between feeds. Avoid hard massage or squeezing the breast.',
    ],
    doctor: 'See a doctor today for a hot, red or hard painful breast with fever or flu feelings, no better after 12 to 24 hours, a firm lump, pus, or pain that lingers after feeds.',
    sources: [
      'https://www.nhs.uk/conditions/pregnancy-and-baby/problems-breastfeeding/',
      'https://www.nct.org.uk/parenting/sore-nipples',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC10481477/',
      'https://www.sfh-tr.nhs.uk/media/6142/pil202303-03-bdm-blocked-ducts-and-mastitis-when-breastfeeding.pdf',
    ],
  },
  pelvic: {
    label: 'Belly and pelvic floor',
    why: 'Pregnancy and birth stretch the tummy muscles and pelvic floor.',
    fix: [
      'Pelvic floor: squeeze and lift inside as if stopping urine. Hold up to 10 seconds, rest, repeat 8 to 10 times, 3 times a day.',
      'Skip crunches, sit-ups and planks until your doctor or physio says you are ready.',
      'Hold a pillow on your C-section scar when you cough, sneeze or laugh.',
    ],
    doctor: 'See a doctor fast for heavy bleeding, fever, a red, swollen or smelly wound, severe belly pain, leg swelling, chest pain, bad headache, or a belly gap wider than 2 fingers at 8 weeks.',
    sources: [
      'https://www.healthline.com/health/diastasis-recti',
      'https://www.nct.org.uk/labour-birth/you-after-birth/episiotomy-care-and-recovery',
      'https://www.plymouthhospitals.nhs.uk/display-pil/pil-post-caesarean-section-c-section--5733/',
      'https://www.walsallhealthcare.nhs.uk/wp-content/uploads/2022/11/Caesarean-Section-Exercises.pdf',
      'https://coch.nhs.uk/media/158742/advice-and-exercises-following-childbirth.pdf',
    ],
  },
}
const stagesA: StageBase[] = [
  {
    title: 'Recovery (weeks 0-2)',
    from: 0,
    focus: 'Rest, heal and feed your baby while your body bleeds, shrinks the womb and starts to recover from birth or surgery.',
    areas: ['breast', 'pelvic', 'back'],
    stageTip: 'Feed lying on your side or leaning back with pillows under your arms and baby, so your stitches, wound and back are not strained.',
    exercise: [
      'Walk gently around the house every day. Start with 2 to 5 minutes, a few times a day. Stop if you bleed more or feel sharp pain.',
      'Pelvic floor squeeze: lift and hold 3 to 10 seconds, rest, repeat up to 10 times, 3 to 5 times a day. Do not hold your breath. Stop if it hurts.',
      'Do not lift anything heavier than your baby, and no driving until you can brake hard without pain (C-section: often a few weeks).',
    ],
    mind: [
      'Mood swings, crying and worry in the first days are common. This is called baby blues. It usually fades within about 2 weeks.',
      'If low mood, deep worry or hopelessness lasts past 2 weeks, or gets worse, tell your midwife, doctor or health visitor. Help works.',
      'Sleep when baby sleeps, even for short naps. Ask your partner to take one feed or night shift (a bottle of expressed milk or a settle and burp job).',
    ],
    doctor: [
      'Call emergency help for chest pain, trouble breathing, or a fast heartbeat that does not settle.',
      'Soaking a pad in an hour, passing large clots, or feeling faint or dizzy with bleeding. This can be heavy blood loss.',
      'Fever of 100.4 F (38 C) or higher, or a sore, tender belly or bad smelling discharge. These can be signs of infection.',
      'Headache that will not go away, vision changes, or very swollen face or hands. This can be a sign of high blood pressure problems.',
      'Thoughts of harming yourself or your baby, or feeling confused or seeing or hearing things that are not there. Get help right away.',
    ],
    sources: [
      'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',
      'https://www.nhs.uk/pregnancy/labour-and-birth/after-the-birth/your-body/',
      'https://www.nhs.uk/conditions/caesarean-section/recovery/',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://womenshealth.gov/a-z-topics/depression-during-and-after-pregnancy',
      'https://womenshealth.gov/mental-health/mental-health-conditions/postpartum-depression',
      'https://postpartum.net/get-help/frequently-asked-questions/',
      'https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/breastfeeding-challenges/sore-nipples/',
      'https://www.ouh.nhs.uk/media/43daol3i/109181exercise.pdf',
      'https://www.who.int/news/item/30-03-2022-who-urges-quality-care-for-women-and-newborns-in-critical-first-weeks-after-childbirth'
    ]
  },
  {
    title: 'Settling in (weeks 3-6)',
    from: 3,
    focus: 'Build a feeding and sleep rhythm, ease pain from carrying and feeding, and slowly add more gentle movement before your 6 week check.',
    areas: ['back', 'neck', 'wrist', 'breast', 'pelvic'],
    stageTip: 'Bring baby to your breast with pillows and keep your head up, ears over shoulders. Switch hands to carry baby to share the load on your wrists.',
    exercise: [
      'Walk 10 to 20 minutes a day at an easy pace. Add a few minutes each week. Slow down or stop if bleeding gets heavier or you feel pelvic heaviness.',
      'Pelvic floor: 10 slow squeezes with a 10 second hold, 3 times a day. Squeeze before you cough, sneeze or lift. Stop if you feel pain.',
      'Gentle core: breathe out and draw your lower belly in, 10 reps, 1 or 2 times a day. Stop if you see a belly bulge or doming, or feel pain.',
    ],
    mind: [
      'Baby blues should be fading by now. If low mood, worry or tears get worse or last past 2 weeks, tell your doctor or midwife. Treatment works.',
      'Plan sleep as a team. Aim for one longer block of sleep (4 to 5 hours) for each parent by taking turns at night.',
      'Share chores with your partner and say clearly what you need. Do not wait for them to guess. Short daily check-ins help.',
    ],
    doctor: [
      'Thoughts of harming yourself or your baby, or feeling confused, or seeing or hearing things that are not there. Get urgent help right away.',
      'Sadness, no joy, hopelessness, or panic that lasts more than 2 weeks, or that stops you from caring for yourself or baby.',
      'Breast that is red, hot and painful with flu-like feeling or fever of 100.4 F (38 C) or higher. See a doctor if no better in 12 to 24 hours.',
      'Bleeding that gets heavier again, bright red bleeding after it had slowed, or bad smelling discharge. Call your care team.',
    ],
    sources: [
      'https://www.cdc.gov/hearher/maternal-warning-signs/index.html',
      'https://www.nhs.uk/pregnancy/labour-and-birth/after-the-birth/your-body/',
      'https://www.nhs.uk/conditions/caesarean-section/recovery/',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://womenshealth.gov/mental-health/mental-health-conditions/postpartum-depression',
      'https://www.nimh.nih.gov/health/publications/perinatal-depression',
      'https://postpartum.net/get-help/frequently-asked-questions/',
      'https://www.cdc.gov/infant-toddler-nutrition/breastfeeding/what-to-expect-while-breastfeeding.html',
      'https://www.esht.nhs.uk/wp-content/uploads/2021/01/0894.pdf',
      'https://www.ouh.nhs.uk/media/43daol3i/109181exercise.pdf',
      'https://www.plymouthhospitals.nhs.uk/download/postnatal-exercises-final-november-2020pdf.pdf?ver=21679&doc=docm93jijm4n10328',
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11677346/'
    ]
  }
];
const stagesB: StageBase[] = [
  {
    title: 'Checkup and rebuilding (weeks 7-12)',
    from: 7,
    focus: 'Get your full checkup, then rebuild slowly: walking, pelvic floor and gentle core first, with good mood support.',
    areas: ['back', 'wrist', 'pelvic'],
    stageTip: 'Baby wrist is common now. Keep your wrist straight when you lift, and slide your whole hand under baby instead of pinching with your thumb.',
    exercise: [
      'Walk 10 to 30 minutes most days. Add time slowly. Slow down or stop if you feel heaviness, leaking or sharp pain.',
      'Pelvic floor: squeeze and lift, hold up to 10 seconds, rest, repeat 10 times. Do it 3 times a day. Breathe normally.',
      'Add light strength 2 days a week: glute bridges, wall push-ups, sit-to-stands. 8 to 10 reps, 1 or 2 sets. Stop if you feel pelvic heaviness.',
    ],
    mind: [
      'Postnatal depression can start any time in the first year. You can have just a few signs and still deserve help.',
      'Ask for a mood check (EPDS) at your checkup. Be honest on it. It is a screen, not a label.',
      'Sleep: take turns with your partner for one longer sleep block of 4 or more hours. Nap when baby naps when you can.',
    ],
    doctor: [
      'Thoughts of harming yourself or your baby, or seeing or hearing things that are not there. Call emergency services or a crisis line right away.',
      'Low mood, panic, strong worry or no bond with baby that lasts more than 2 weeks or gets worse.',
      'Bleeding that soaks a pad in an hour, large clots, or bleeding that returns or stays heavy after week 8.',
      'Leaking urine or stool, or a heavy dragging feeling in your pelvis. A pelvic health physio can help.',
    ],
    sources: [
      'https://www.nhs.uk/conditions/baby/support-and-services/your-post-pregnancy-body/',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/symptoms/',
      'https://www.mdedge.com/obgyn/article/164040/obstetrics/acog-advises-earlier-more-comprehensive-postpartum-care/page/0/1',
      'https://athleticsni.org/Clubs/Health-&-Support/Return-to-Running',
      'https://pubmed.ncbi.nlm.nih.gov/38191239/',
      'https://cdc.gov/hearher/maternal-warning-signs/index.html',
      'https://www.hse.ie/conditions/thumb-wrist-pain-after-baby/',
      'https://www.mater.org.au/health-services/our-services/after-birth-thumb-and-wrist-pain',
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11023973/',
      'https://jcadonline.com/1941-2789-17-5-15/',
      'https://www.imperial.nhs.uk/our-services/maternity-services/postnatal-care/contraception-after-birth'
    ]
  },
  {
    title: 'Getting stronger (weeks 13-26)',
    from: 13,
    focus: 'Build real strength and fitness step by step while baby gets heavier, and keep an eye on your mood and rest.',
    areas: ['back', 'neck', 'wrist', 'pelvic'],
    stageTip: 'Baby is heavier now. Use a well fitted carrier with wide straps, switch sides often, and keep baby close to your chest to ease your neck and back.',
    exercise: [
      'Build to 150 minutes of moderate activity a week, like brisk walking. Split it into 10 to 30 minute blocks. Stop if you leak or feel heaviness.',
      'Strength 2 to 3 days a week: squats, rows, hip hinges, step-ups. 8 to 12 reps, 2 or 3 sets. Add weight slowly. Stop if you feel doming or pelvic pressure.',
      'Keep pelvic floor squeezes daily: 10 long holds and 10 quick squeezes, 3 times a day. Do a squeeze before lifting or jumping.',
    ],
    mind: [
      'Anxiety and low mood can still start or grow now. Worry that will not switch off, even when baby sleeps, is a reason to get help.',
      'Sleep loss builds up. Protect one longer sleep block each night, and ask family or friends to take one task off your list.',
      'Check in with your partner every week for 10 minutes. Share the night shifts, chores and baby care so one person does not carry it all.',
    ],
    doctor: [
      'Thoughts of self harm or harming your baby, or feeling out of touch with reality. Get emergency help at once.',
      'Panic attacks, scary thoughts that keep coming back, or you cannot sleep even when baby does.',
      'Leaking urine or stool, a bulge in your vagina, or heavy dragging in your pelvis, especially when you run or lift.',
      'Belly bulge or cone shape when you sit up or lift that gets worse, or pain in your lower back or pelvis that stops you from daily tasks.',
    ],
    sources: [
      'https://pubmed.ncbi.nlm.nih.gov/38191239/',
      'https://bjsm.bmj.com/content/58/4/183',
      'https://athleticsni.org/Clubs/Health-&-Support/Return-to-Running',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/symptoms/',
      'https://cdc.gov/hearher/maternal-warning-signs/index.html',
      'https://www.mater.org.au/health-services/our-services/after-birth-thumb-and-wrist-pain',
      'https://www.hse.ie/conditions/thumb-wrist-pain-after-baby/',
      'https://www.pregnancy.com.au/safe-babywearing/',
      'https://www.motherandbaby.com/baby-and-toddler/baby/looking-after-your-baby/guide-to-babywearing/',
      'https://jcadonline.com/1941-2789-17-5-15/'
    ]
  }
]
const stagesC: StageBase[] = [
  {
    title: 'Always moving (weeks 27-52)',
    from: 27,
    focus: 'Your baby crawls, pulls up and gets heavier, so your back, wrists and knees work harder while sleep and mood still need care.',
    areas: ['back', 'wrist', 'neck', 'pelvic'],
    stageTip: 'Play on the floor in short blocks and change position often. Kneel or sit on a cushion with your back supported instead of bending over a crawling baby.',
    exercise: [
      'Walk briskly with the stroller or carrier for 10 to 30 minutes, most days. Aim for 150 minutes a week over time. Stop if you leak, feel heaviness or pain.',
      'Do strength work on 2 days a week: squats, glute bridges, rows with a band. 8 to 12 reps, 2 sets. Stop if sharp pain or pelvic heaviness shows up.',
      'Lift your baby with bent knees and a straight back. Hold baby close to your body and breathe out as you lift. Do not twist while lifting.',
    ],
    mind: [
      'Baby blues are short, but postnatal depression can start up to a year after birth. Low mood, worry or feeling you cannot cope for 2 weeks or more is worth telling someone.',
      'Parent burnout can build now. Signs are deep tiredness, feeling distant from your baby and feeling you are not the parent you were. Share it with a doctor or a trusted person.',
      'Sleep: babies often wake at night in this stage. Take turns with your partner, nap when baby naps when you can, and ask for one longer sleep block each week.',
    ],
    doctor: [
      'Thoughts of harming yourself or your baby. Seek urgent help now (emergency number or crisis line).',
      'Low mood, hopelessness, panic or constant worry that lasts more than 2 weeks or stops you from daily tasks.',
      'Back pain that is severe, wakes you at night, or comes with leg weakness, numbness or trouble passing urine or stool.',
      'Pain, swelling or a catching feeling on the thumb side of the wrist that does not ease after a few weeks of rest and care.',
    ],
    sources: [
      'https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/',
      'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html',
      'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
      'https://www.nhs.uk/baby/support-and-services/your-post-pregnancy-body/',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://www.nhs.uk/conditions/baby/babys-development/behaviour/separation-anxiety/',
      'https://www.hse.ie/conditions/thumb-wrist-pain-after-baby/',
      'https://www.apa.org/monitor/2021/10/cover-parental-burnout',
      'https://health.clevelandclinic.org/mom-guilt',
      'https://my.clevelandclinic.org/health/diseases/9312-postpartum-depression',
      'https://family.kentcht.nhs.uk/baby/you-and-your-baby-birth-to-1-year/childcare-and-returning-to-work/',
      'https://bjsm.bmj.com/content/54/18/1114'
    ]
  },
  {
    title: 'Toddler years (1 year and up)',
    from: 53,
    focus: 'Your toddler walks, runs and wants to be carried, so protect your back, hips and knees and care for your own mood, sleep and time.',
    areas: ['back', 'neck', 'wrist', 'pelvic'],
    stageTip: 'Do not carry a toddler on one hip all day. Swap sides, use a carrier with hip support, and let your child walk or climb stairs for part of the trip.',
    exercise: [
      'Get 150 minutes a week of moderate activity, like brisk walking or playground play. Short 10 minute blocks count. Stop if you feel chest pain or dizziness.',
      'Do strength work on 2 days a week for legs, hips, back, belly, chest and arms. 8 to 12 reps, 2 sets. Stop if pain is sharp or pelvic heaviness shows up.',
      'Squat to pick up your toddler and toys. Knees bent, back straight, child close. Do 10 slow squats daily as practice. Stop if your knees hurt.',
    ],
    mind: [
      'Postnatal depression and anxiety can still appear in the second year. Symptoms that last 2 weeks or more are a reason to talk to a doctor or health visitor.',
      'Burnout check: if you feel empty, distant from your child or fed up for weeks, tell your doctor. It is common and it can improve with support.',
      'Protect sleep: toddlers aged 1 to 2 need about 11 to 14 hours in 24 hours. A steady bedtime routine helps. Share night duty and rest when you can.',
    ],
    doctor: [
      'Thoughts of suicide or of harming yourself or your child. Seek urgent help now (emergency number or crisis line).',
      'Low mood, panic, constant worry or loss of interest that lasts more than 2 weeks and affects daily life.',
      'Back or hip pain that wakes you at night, spreads down the leg, or comes with numbness, weakness or bladder or bowel changes.',
      'Leaking urine or stool, a bulge or heaviness in the vagina, or pain with sex that continues.',
    ],
    sources: [
      'https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/',
      'https://www.cdc.gov/physical-activity-basics/guidelines/adults.html',
      'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
      'https://www.nhs.uk/baby/support-and-services/your-post-pregnancy-body/',
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://www.nhs.uk/conditions/baby/babys-development/behaviour/temper-tantrums/',
      'https://www.nhs.uk/conditions/baby/babys-development/behaviour/separation-anxiety/',
      'https://www.apa.org/monitor/2021/10/cover-parental-burnout',
      'https://www.cdc.gov/sleep/about/index.html',
      'https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-kids-need',
      'https://health.clevelandclinic.org/mom-guilt',
      'https://bjsm.bmj.com/content/54/18/1114'
    ]
  }
]

export const painAreas = painAreasData;

// Ordered by `from`. Baby week picks the last stage whose `from` <= week.

interface DadData { from: number; dad: string[]; sources: string[] }
const dadA: DadData[] = [
  {
    from: 0,
    dad: [
      'Take one night shift so mom gets a 4 to 5 hour sleep block. Bring baby to her only for feeds.',
      'Do the meals, water, laundry and visitors. After a C-section, you lift and carry. She rests.',
      'Call the doctor or go to the ER for heavy bleeding, fever, chest pain, bad headache or thoughts of self harm.',
      'Do skin to skin with baby daily. Also eat, sleep and ask a friend for help. About 1 in 10 dads get low mood.',
    ],
    sources: [
      'https://cdc.gov/hearher/maternal-warning-signs/index.html',
      'https://www.nct.org.uk/life-parent/how-you-might-be-feeling/spotting-postnatal-depression-your-partner',
      'https://pubmed.ncbi.nlm.nih.gov/31757623/',
    ],
  },
  {
    from: 3,
    dad: [
      'Own one feed or one wake up each night. Burp, change and settle baby so mom can sleep.',
      'Plan and cook meals for the week. Handle shopping and chores so mom does not carry it all.',
      'Sad, weepy or anxious past 2 weeks? Listen, do not fix. Help her book a doctor or health visitor visit.',
      'Take baby for a walk or bath each day. Watch your own mood: anger, withdrawal or more drinking means talk to a GP.',
    ],
    sources: [
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/symptoms/',
      'https://www.nct.org.uk/life-parent/how-you-might-be-feeling/spotting-postnatal-depression-your-partner',
      'https://www.tommys.org/pregnancy-information/dads-and-partners/looking-after-your-mental-health-after-baby-born',
    ],
  },
  {
    from: 7,
    dad: [
      'Go with mom to the 6 to 8 week checkup. Mind baby, drive, and help her ask her questions.',
      'Share the load fairly. Do the same baby jobs each day so she can rest, exercise or see friends.',
      'Ask mom how she really feels, often. Praise her. Constant worry, no joy or low mood needs a doctor.',
      'Dad symptoms often peak at 3 to 6 months. Keep sleep, exercise and a friend to talk to. Seek help early.',
    ],
    sources: [
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/symptoms/',
      'https://www.tommys.org/pregnancy-information/dads-and-partners/looking-after-your-mental-health-after-baby-born',
      'https://pubmed.ncbi.nlm.nih.gov/31757623/',
    ],
  },
]
const dadB: DadData[] = [
  {
    from: 13,
    dad: [
      'Own one daily job fully, like bath or dinner. Do not wait to be asked.',
      'Take a fixed sleep shift each week so mom gets one long block of rest.',
      'Low mood, worry or no joy that lasts, or feeling cut off from baby? Tell her GP or nurse together.',
      'Dads\' low mood is most common around 3 to 6 months. Irritable or distant? Talk to a friend or doctor.',
    ],
    sources: [
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://www.nhs.uk/start-for-life/baby/your-mental-health/',
      'https://www.postpartum.net/get-help/help-for-dads/',
      'https://rti.org/publication/prenatal-postpartum-depression-fathers-association-maternal-depression-meta-analysis',
    ],
  },
  {
    from: 27,
    dad: [
      'Take over heavy lifting: car seat, stroller, baby from the floor. It spares mom\'s back and wrists.',
      'Do the baby tasks that nobody sees, like daycare bags, doctor visits and food shopping.',
      'Ask often: how are you really? Watch for a low mood, worry or no joy that lasts, and seek help.',
      'Do floor play and a bedtime routine on your own. It builds your bond and gives mom a break.',
    ],
    sources: [
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://www.nhs.uk/start-for-life/baby/your-mental-health/',
      'https://www.postpartum.net/get-help/help-for-dads/',
      'https://blog.policy.manchester.ac.uk/growth_inclusion/2019/11/does-fathers-involvement-in-childcare-influence-mothers-employment-post-childbirth/',
    ],
  },
  {
    from: 53,
    dad: [
      'Share the mental load: track the doctor visits, daycare and shopping lists yourself.',
      'If mom works, take half the daycare runs, sick days and night wakings.',
      'Book weekly time for mom to exercise or rest, and a date for the two of you.',
      'Tantrums are normal. Stay calm, get low, and be kind. Look after your own sleep, too.',
    ],
    sources: [
      'https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/',
      'https://www.nhs.uk/start-for-life/baby/your-mental-health/',
      'https://www.postpartum.net/get-help/help-for-dads/',
      'https://blog.policy.manchester.ac.uk/growth_inclusion/2019/11/does-fathers-involvement-in-childcare-influence-mothers-employment-post-childbirth/',
    ],
  },
]

const dadData = [...dadA, ...dadB];

export const momStages: MomStage[] = [...stagesA, ...stagesB, ...stagesC].map(st => {
  const d = dadData.find(x => x.from === st.from);
  return { ...st, dad: d?.dad ?? [], sources: [...st.sources, ...(d?.sources ?? [])] };
});

export function getMomStage(week: number): MomStage {
  return [...momStages].reverse().find(s => s.from <= week) ?? momStages[0];
}
