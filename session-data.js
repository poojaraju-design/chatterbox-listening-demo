const fullSession = {
  "referenceLabel": "Kokoro · 70% Bella + 30% Heart",
  "referenceKey": "kokoro",
  "turns": [
    {
      "scenario": "Opening",
      "file": "audio/assistant_01.wav",
      "assistant": "Hi there, it's good to see you today! How have your hands been feeling lately — has your grip and stiffness stayed comfortable, or have you noticed any changes?",
      "patient": "Yeah it's pretty much same as before",
      "duration": 9.86,
      "sha256": "c45ab3c805e521306fd9cd959e8fbb8a081fc08086c473993fbd7e2c324941b5"
    },
    {
      "scenario": "Morning stiffness",
      "file": "audio/assistant_02.wav",
      "assistant": "I'd love to hear a little more about that — how have your mornings been feeling lately, like when you first wake up and start moving around?",
      "patient": "maybe 30 minutes before it loosens up",
      "duration": 7.58,
      "sha256": "1fc7ec0d92816447773d401ed841dbf1ee7f4643416130437503ff6f168fc937"
    },
    {
      "scenario": "Affected joints",
      "file": "audio/assistant_03.wav",
      "assistant": "During those 30 minutes before things loosen up, which joints are giving you the most trouble — is it mainly your hands, or do you notice it in other spots like your wrists, shoulders, or knees too?",
      "patient": "mainly my hands, both sides. it's actually been worse the past few days honestly, more stiffness than usual",
      "duration": 12.74,
      "sha256": "5ef26e5939e73797bb73e7f4f310107b30d87ab5bd1616de2c0e2fa5e6c3393c"
    },
    {
      "scenario": "Swelling",
      "file": "audio/assistant_04.wav",
      "assistant": "Since that stiffness in both hands has gotten noticeably worse over just a few days, I want to ask — are you also seeing any puffiness or feeling any swelling when you touch your joints?",
      "patient": "yeah actually, my knuckles look a little puffy, especially in the mornings",
      "duration": 11.62,
      "sha256": "20004a7cc799e42f15a2524404bd3b4644dff8e115989a57acd52c3665d080b6"
    },
    {
      "scenario": "New symptoms",
      "file": "audio/assistant_05.wav",
      "assistant": "That morning puffiness in your knuckles — is that something new for you, or has it gotten worse compared to how your hands have been lately?",
      "patient": "it's new, I haven't noticed the puffiness before, just the past few days along with everything else",
      "duration": 8.02,
      "sha256": "f3693acfc36d19c09352f6f1deaae761f4494447d561fc3a9761fe3c1a50200e"
    },
    {
      "scenario": "Recent illness",
      "file": "audio/assistant_06.wav",
      "assistant": "That kind of sudden change — new puffiness alongside worsening stiffness all within just a few days — is really worth paying close attention to. In the days or week just before this started, did you have any kind of illness, even something mild like a cold, sore throat, or stomach bug?",
      "patient": "no, nothing like that, I've been feeling fine otherwise",
      "duration": 19.82,
      "sha256": "155ba951577ba8e8006b97c480b8aa8ac7104dbafcd5b24e922b489b651b70ab"
    },
    {
      "scenario": "Medication routine",
      "file": "audio/assistant_07.wav",
      "assistant": "That's reassuring to hear — since the swelling seems to have come on without any obvious illness, I want to make sure we're not missing something on the medication side: have you been able to take all your usual medications consistently over the past week or two, or were there any doses that got skipped?",
      "patient": "actually now that you mention it, I think I missed a few doses these past couple weeks, been kind of busy",
      "duration": 13.42,
      "sha256": "2079ac051d8eec2563b44184e1deb0b77b5d5af90cd98781e8e2128eb4b1b247"
    },
    {
      "scenario": "Stress",
      "file": "audio/assistant_08.wav",
      "assistant": "That makes a lot of sense, and it's actually helpful context — when life gets busy, it's easy for routines to slip. Has the busyness also meant more stress than usual for you lately?",
      "patient": "yeah, work's been pretty stressful the past couple weeks honestly",
      "duration": 11.86,
      "sha256": "5a37b388858b2275ceab600c7197277ff140d73b8f4cdc043e37b42243fcc672"
    },
    {
      "scenario": "Pain rating",
      "file": "audio/assistant_09.wav",
      "assistant": "That makes sense — stress and flares have a way of showing up at the same time. On a scale of 0 to 10, where 0 is no pain at all and 10 is the worst you can imagine, how would you rate the pain in your hands right now?",
      "patient": "I'd say about a 6",
      "duration": 14.94,
      "sha256": "00e3fb26876b6239f1434a78f8ff4b76f3d474e28d5250f2ed28971ac8641646"
    },
    {
      "scenario": "Pain with activity",
      "file": "audio/assistant_10.wav",
      "assistant": "Is that a 6 even when your hands are just resting, or does it climb when you're actually using them — like gripping something or trying to open a jar?",
      "patient": "it's there even just resting, but yeah it's worse when I try to grip anything",
      "duration": 9.74,
      "sha256": "8918e083d315ed5d4dcb87df9f7bcfd7eaa8782b88f0a56bd893eca9d15aeb85"
    },
    {
      "scenario": "Fatigue",
      "file": "audio/assistant_11.wav",
      "assistant": "Pain that's there even when you're just sitting still really takes it out of you — have you been feeling more fatigued overall lately, beyond just the hands?",
      "patient": "yeah actually, I've been more tired than usual, especially by the afternoon",
      "duration": 9.62,
      "sha256": "b3e0beaccb219e8bb885febe91ad5d3521dbc191326efa77fda6d0cda724bedd"
    },
    {
      "scenario": "Daily activities",
      "file": "audio/assistant_12.wav",
      "assistant": "That's a lot to carry alongside the hand pain — is the afternoon tiredness actually stopping you from getting things done that you'd normally handle during the day?",
      "patient": "yeah it does slow me down some, but honestly what I really want to focus on is just getting back on track with my medication. I think that's the main thing",
      "duration": 9.74,
      "sha256": "4dd9d5610b563caa0c72f45344edc3c030345b2e2ad7556cda0abdac4ed6f71e"
    },
    {
      "scenario": "Patient priority",
      "file": "audio/assistant_13.wav",
      "assistant": "Getting back on your medication is absolutely the right focus, and we'll make sure you leave today with a clear plan for that. That afternoon tiredness you mentioned — when you do sit down or rest for a bit, does it actually help, or does the fatigue stick around regardless?",
      "patient": "yeah actually, resting does help some, I feel a bit better after",
      "duration": 17.26,
      "sha256": "cb4f28c532179f0c8360bd65906affe54ff7f70eac92a0a83a76209e5527402e"
    },
    {
      "scenario": "Joint clarification",
      "file": "audio/assistant_14.wav",
      "assistant": "Is it mostly your hands, or are you feeling it in your wrists or finger knuckles too?",
      "patient": "knuckles mainly, not really my wrists",
      "duration": 5.14,
      "sha256": "92600c200dab8751589dd038cb87ffa41e8ffb588a7cc2a72aaf113b9bc61a61"
    },
    {
      "scenario": "Missed doses",
      "file": "audio/assistant_15.wav",
      "assistant": "That knuckle flare really does line up with the hydroxychloroquine gap you mentioned — over these past two weeks, roughly how many doses do you think you missed, a handful here and there, or closer to most of them?",
      "patient": "probably missed most of them the past couple weeks, maybe only took it once or twice",
      "duration": 13.3,
      "sha256": "559d5472a02e14e24f075d6eda3194bb8a8b3d15ec3d61e4c7b622ea51c4c65d"
    }
  ]
};
