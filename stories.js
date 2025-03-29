/*****************************************************
  STORIES DATA
*****************************************************/

window.ALL_STORIES_HTML = `
<!-- STORY 1 -->
<div id="story-1" class="story-container">
  <h2>Story 1: "The Lost Kitten"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-1-draggables">
    <div class="draggable" draggable="true" data-part="introduction" data-text="One sunny morning, Mia found a tiny kitten outside her door.">
      One sunny morning, Mia found a tiny kitten outside her door.
    </div>
    <div class="draggable" draggable="true" data-part="rising" data-text="She asked all her neighbors if they had lost a kitten, hoping to find its owner.">
      She asked all her neighbors if they had lost a kitten, hoping to find its owner.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="Mia took the kitten home, fed it, and gave it a cozy bed.">
      Mia took the kitten home, fed it, and gave it a cozy bed.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="Finally, she discovered a poster for a missing kitten, but it wasn't the same one!">
      Finally, she discovered a poster for a missing kitten, but it wasn't the same one!
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="She decided to adopt the kitten, naming it Snowball.">
      She decided to adopt the kitten, naming it Snowball.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-1-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-1')">Submit</button>
  </div>
  <div class="congratulations" id="story-1-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-1-quiz">
    <h3>Quiz: "The Lost Kitten"</h3>
    <div class="quiz-question">
      <p>1. Where did Mia find the kitten?</p>
      <label><input type="radio" name="story-1-q1" value="correct"> Outside her door</label><br>
      <label><input type="radio" name="story-1-q1" value="wrong"> By the river</label><br>
      <label><input type="radio" name="story-1-q1" value="wrong"> On the sidewalk downtown</label><br>
    </div>
    <div class="quiz-question">
      <p>2. Why did she talk to the neighbors?</p>
      <label><input type="radio" name="story-1-q2" value="correct"> To find the kitten's owner</label><br>
      <label><input type="radio" name="story-1-q2" value="wrong"> To borrow some milk</label><br>
      <label><input type="radio" name="story-1-q2" value="wrong"> To invite them for dinner</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The poster Mia found was:</p>
      <label><input type="radio" name="story-1-q3" value="correct"> For a different missing kitten</label><br>
      <label><input type="radio" name="story-1-q3" value="wrong"> Exactly the same kitten</label><br>
      <label><input type="radio" name="story-1-q3" value="wrong"> For a missing puppy</label><br>
    </div>
    <div class="quiz-question">
      <p>4. What did Mia do after bringing the kitten home?</p>
      <label><input type="radio" name="story-1-q4" value="wrong"> She made it do tricks</label><br>
      <label><input type="radio" name="story-1-q4" value="correct"> She fed it and gave it a cozy bed</label><br>
      <label><input type="radio" name="story-1-q4" value="wrong"> She sent it away</label><br>
    </div>
    <div class="quiz-question">
      <p>5. How did the story end?</p>
      <label><input type="radio" name="story-1-q5" value="wrong"> The kitten wandered off again</label><br>
      <label><input type="radio" name="story-1-q5" value="correct"> Mia adopted the kitten and named it Snowball</label><br>
      <label><input type="radio" name="story-1-q5" value="wrong"> Her neighbor took the kitten</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-1')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-1-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('intro-page')">&laquo; Back</button>
    <button class="btn" id="story-1-next" onclick="showStory('story-2')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 2 -->
<div id="story-2" class="story-container">
  <h2>Story 2: "Max and the Magic Seed"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-2-draggables">
    <div class="draggable" draggable="true" data-part="rising" data-text="He planted it in his backyard, excited to see what would happen.">
      He planted it in his backyard, excited to see what would happen.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="One day, Max discovered a shiny seed that sparkled in the sun.">
      One day, Max discovered a shiny seed that sparkled in the sun.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="A giant beanstalk shot up suddenly, stretching high into the clouds!">
      A giant beanstalk shot up suddenly, stretching high into the clouds!
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="He returned home with a new friend, a small bird that lived at the top.">
      He returned home with a new friend, a small bird that lived at the top.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="Max climbed the stalk, carefully watering the leaves as he went.">
      Max climbed the stalk, carefully watering the leaves as he went.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-2-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-2')">Submit</button>
  </div>
  <div class="congratulations" id="story-2-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-2-quiz">
    <h3>Quiz: "Max and the Magic Seed"</h3>
    <div class="quiz-question">
      <p>1. What did Max find?</p>
      <label><input type="radio" name="story-2-q1" value="correct"> A shiny seed</label><br>
      <label><input type="radio" name="story-2-q1" value="wrong"> A golden egg</label><br>
      <label><input type="radio" name="story-2-q1" value="wrong"> A magic shovel</label><br>
    </div>
    <div class="quiz-question">
      <p>2. Where did he plant the seed?</p>
      <label><input type="radio" name="story-2-q2" value="correct"> In his backyard</label><br>
      <label><input type="radio" name="story-2-q2" value="wrong"> In a flowerpot</label><br>
      <label><input type="radio" name="story-2-q2" value="wrong"> In a forest</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The climax was when:</p>
      <label><input type="radio" name="story-2-q3" value="wrong"> Max fell asleep</label><br>
      <label><input type="radio" name="story-2-q3" value="correct"> The beanstalk suddenly grew into the sky</label><br>
      <label><input type="radio" name="story-2-q3" value="wrong"> It rained all day</label><br>
    </div>
    <div class="quiz-question">
      <p>4. How did Max handle the beanstalk?</p>
      <label><input type="radio" name="story-2-q4" value="correct"> He climbed it and watered the leaves</label><br>
      <label><input type="radio" name="story-2-q4" value="wrong"> He chopped it down immediately</label><br>
      <label><input type="radio" name="story-2-q4" value="wrong"> He ignored it</label><br>
    </div>
    <div class="quiz-question">
      <p>5. What new friend did Max meet?</p>
      <label><input type="radio" name="story-2-q5" value="wrong"> A giant monkey</label><br>
      <label><input type="radio" name="story-2-q5" value="correct"> A small bird</label><br>
      <label><input type="radio" name="story-2-q5" value="wrong"> A talking cat</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-2')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-2-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-1')">&laquo; Back</button>
    <button class="btn" id="story-2-next" onclick="showStory('story-3')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 3 -->
<div id="story-3" class="story-container">
  <h2>Story 3: "Lucy and the Broken Robot"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-3-draggables">
    <div class="draggable" draggable="true" data-part="rising" data-text="She searched her house for tools and a new battery to fix the robot.">
      She searched her house for tools and a new battery to fix the robot.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Lucy found an old robot in her attic, missing its battery.">
      Lucy found an old robot in her attic, missing its battery.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="The robot beeped and tested its arms, spinning in circles happily.">
      The robot beeped and tested its arms, spinning in circles happily.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="Sparks flew as she connected the wires, and the robot's eyes lit up!">
      Sparks flew as she connected the wires, and the robot's eyes lit up!
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="Lucy and her new friend danced around the attic, excited to explore more.">
      Lucy and her new friend danced around the attic, excited to explore more.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-3-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-3')">Submit</button>
  </div>
  <div class="congratulations" id="story-3-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-3-quiz">
    <h3>Quiz: "Lucy and the Broken Robot"</h3>
    <div class="quiz-question">
      <p>1. Where did Lucy find the robot?</p>
      <label><input type="radio" name="story-3-q1" value="wrong"> Under the bed</label><br>
      <label><input type="radio" name="story-3-q1" value="correct"> In her attic</label><br>
      <label><input type="radio" name="story-3-q1" value="wrong"> In the garage</label><br>
    </div>
    <div class="quiz-question">
      <p>2. The robot was missing:</p>
      <label><input type="radio" name="story-3-q2" value="wrong"> One arm</label><br>
      <label><input type="radio" name="story-3-q2" value="correct"> Its battery</label><br>
      <label><input type="radio" name="story-3-q2" value="wrong"> A screen</label><br>
    </div>
    <div class="quiz-question">
      <p>3. How did Lucy bring the robot back to life?</p>
      <label><input type="radio" name="story-3-q3" value="correct"> She found tools and connected a battery</label><br>
      <label><input type="radio" name="story-3-q3" value="wrong"> She spoke magic words</label><br>
      <label><input type="radio" name="story-3-q3" value="wrong"> She used duct tape</label><br>
    </div>
    <div class="quiz-question">
      <p>4. The climax was when:</p>
      <label><input type="radio" name="story-3-q4" value="correct"> Sparks flew and the robot's eyes lit up</label><br>
      <label><input type="radio" name="story-3-q4" value="wrong"> Lucy tripped and fell</label><br>
      <label><input type="radio" name="story-3-q4" value="wrong"> The attic lights went out</label><br>
    </div>
    <div class="quiz-question">
      <p>5. Finally, Lucy:</p>
      <label><input type="radio" name="story-3-q5" value="correct"> Danced around with her new robot friend</label><br>
      <label><input type="radio" name="story-3-q5" value="wrong"> Threw the robot away</label><br>
      <label><input type="radio" name="story-3-q5" value="wrong"> Sold the robot</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-3')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-3-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-2')">&laquo; Back</button>
    <button class="btn" id="story-3-next" onclick="showStory('story-4')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 4 -->
<div id="story-4" class="story-container">
  <h2>Story 4: "Ben's Big Race"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-4-draggables">
    <div class="draggable" draggable="true" data-part="introduction" data-text="Ben woke up on race day feeling excited and a little scared.">
      Ben woke up on race day feeling excited and a little scared.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="Near the end, he almost tripped, but he kept running!">
      Near the end, he almost tripped, but he kept running!
    </div>
    <div class="draggable" draggable="true" data-part="rising" data-text="At the starting line, he stretched and started running as fast as he could.">
      At the starting line, he stretched and started running as fast as he could.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="His friends cheered, and Ben celebrated with a big smile and a cold drink.">
      His friends cheered, and Ben celebrated with a big smile and a cold drink.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="He crossed the finish line and slowed down, feeling proud.">
      He crossed the finish line and slowed down, feeling proud.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-4-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-4')">Submit</button>
  </div>
  <div class="congratulations" id="story-4-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-4-quiz">
    <h3>Quiz: "Ben's Big Race"</h3>
    <div class="quiz-question">
      <p>1. How did Ben feel on race day?</p>
      <label><input type="radio" name="story-4-q1" value="wrong"> Very sleepy</label><br>
      <label><input type="radio" name="story-4-q1" value="correct"> Excited and a little scared</label><br>
      <label><input type="radio" name="story-4-q1" value="wrong"> Angry</label><br>
    </div>
    <div class="quiz-question">
      <p>2. Ben started the race by:</p>
      <label><input type="radio" name="story-4-q2" value="correct"> Stretching and running fast</label><br>
      <label><input type="radio" name="story-4-q2" value="wrong"> Taking a nap</label><br>
      <label><input type="radio" name="story-4-q2" value="wrong"> Waiting too long</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The most intense moment was:</p>
      <label><input type="radio" name="story-4-q3" value="correct"> When he almost tripped but kept going</label><br>
      <label><input type="radio" name="story-4-q3" value="wrong"> When the crowd left</label><br>
      <label><input type="radio" name="story-4-q3" value="wrong"> When he stopped running</label><br>
    </div>
    <div class="quiz-question">
      <p>4. After the finish line, Ben:</p>
      <label><input type="radio" name="story-4-q4" value="wrong"> Collapsed without celebrating</label><br>
      <label><input type="radio" name="story-4-q4" value="correct"> Felt proud and caught his breath</label><br>
      <label><input type="radio" name="story-4-q4" value="wrong"> Started another race immediately</label><br>
    </div>
    <div class="quiz-question">
      <p>5. In the end, Ben:</p>
      <label><input type="radio" name="story-4-q5" value="wrong"> Went home sad</label><br>
      <label><input type="radio" name="story-4-q5" value="correct"> Celebrated with his friends</label><br>
      <label><input type="radio" name="story-4-q5" value="wrong"> Gave up running</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-4')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-4-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-3')">&laquo; Back</button>
    <button class="btn" id="story-4-next" onclick="showStory('story-5')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 5 -->
<div id="story-5" class="story-container">
  <h2>Story 5: "The Mysterious Note"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-5-draggables">
    <div class="draggable" draggable="true" data-part="resolution" data-text="They opened the gifts, laughing, and planned a picnic in the garden.">
      They opened the gifts, laughing, and planned a picnic in the garden.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Sarah found a folded paper on her desk that said, 'Meet me at the garden gate.'">
      Sarah found a folded paper on her desk that said, 'Meet me at the garden gate.'
    </div>
    <div class="draggable" draggable="true" data-part="rising" data-text="She searched the house, wondering who left the note and why.">
      She searched the house, wondering who left the note and why.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="She found her best friend there, holding two small gift boxes.">
      She found her best friend there, holding two small gift boxes.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="Sarah finally went to the garden at dusk, heart pounding with curiosity.">
      Sarah finally went to the garden at dusk, heart pounding with curiosity.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-5-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-5')">Submit</button>
  </div>
  <div class="congratulations" id="story-5-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-5-quiz">
    <h3>Quiz: "The Mysterious Note"</h3>
    <div class="quiz-question">
      <p>1. Where did Sarah find the paper?</p>
      <label><input type="radio" name="story-5-q1" value="wrong"> In her shoe</label><br>
      <label><input type="radio" name="story-5-q1" value="correct"> On her desk</label><br>
      <label><input type="radio" name="story-5-q1" value="wrong"> In the mailbox</label><br>
    </div>
    <div class="quiz-question">
      <p>2. The note told her to:</p>
      <label><input type="radio" name="story-5-q2" value="wrong"> Go to the kitchen</label><br>
      <label><input type="radio" name="story-5-q2" value="correct"> Meet at the garden gate</label><br>
      <label><input type="radio" name="story-5-q2" value="wrong"> Bring a ladder</label><br>
    </div>
    <div class="quiz-question">
      <p>3. She felt curious because:</p>
      <label><input type="radio" name="story-5-q3" value="wrong"> She wanted to throw a party</label><br>
      <label><input type="radio" name="story-5-q3" value="correct"> She didn't know who left the note</label><br>
      <label><input type="radio" name="story-5-q3" value="wrong"> She already knew who wrote it</label><br>
    </div>
    <div class="quiz-question">
      <p>4. The climax was when Sarah:</p>
      <label><input type="radio" name="story-5-q4" value="correct"> Went to the garden at dusk, heart pounding</label><br>
      <label><input type="radio" name="story-5-q4" value="wrong"> Decided to ignore the note</label><br>
      <label><input type="radio" name="story-5-q4" value="wrong"> Went to bed early</label><br>
    </div>
    <div class="quiz-question">
      <p>5. In the end, she:</p>
      <label><input type="radio" name="story-5-q5" value="correct"> Opened gifts with her friend and planned a picnic</label><br>
      <label><input type="radio" name="story-5-q5" value="wrong"> Threw the note away</label><br>
      <label><input type="radio" name="story-5-q5" value="wrong"> Found no one in the garden</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-5')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-5-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-4')">&laquo; Back</button>
    <button class="btn" id="story-5-next" onclick="showStory('story-6')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 6 -->
<div id="story-6" class="story-container">
  <h2>Story 6: "Jenna's Sandcastle Challenge"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-6-draggables">
    <div class="draggable" draggable="true" data-part="rising" data-text="A huge wave destroyed Jenna's first sandcastle, so she decided to build walls.">
      A huge wave destroyed Jenna's first sandcastle, so she decided to build walls.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="They worked together to shape a tall, strong sandcastle despite the crashing waves.">
      They worked together to shape a tall, strong sandcastle despite the crashing waves.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="They decided both were winners and shared ice cream to celebrate.">
      They decided both were winners and shared ice cream to celebrate.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Jenna and her friend Marco went to the beach to build sandcastles.">
      Jenna and her friend Marco went to the beach to build sandcastles.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="Both sandcastles stayed up, and curious beach-goers admired their work.">
      Both sandcastles stayed up, and curious beach-goers admired their work.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-6-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-6')">Submit</button>
  </div>
  <div class="congratulations" id="story-6-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-6-quiz">
    <h3>Quiz: "Jenna's Sandcastle Challenge"</h3>
    <div class="quiz-question">
      <p>1. Who went to the beach?</p>
      <label><input type="radio" name="story-6-q1" value="wrong"> Jenna and her cousin</label><br>
      <label><input type="radio" name="story-6-q1" value="correct"> Jenna and Marco</label><br>
      <label><input type="radio" name="story-6-q1" value="wrong"> Only Jenna</label><br>
    </div>
    <div class="quiz-question">
      <p>2. What happened to Jenna's first sandcastle?</p>
      <label><input type="radio" name="story-6-q2" value="wrong"> A bird stepped on it</label><br>
      <label><input type="radio" name="story-6-q2" value="correct"> A big wave destroyed it</label><br>
      <label><input type="radio" name="story-6-q2" value="wrong"> It was stolen</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The climax was when:</p>
      <label><input type="radio" name="story-6-q3" value="wrong"> They left the beach</label><br>
      <label><input type="radio" name="story-6-q3" value="correct"> They built a tall castle together</label><br>
      <label><input type="radio" name="story-6-q3" value="wrong"> They fell asleep in the sand</label><br>
    </div>
    <div class="quiz-question">
      <p>4. During the falling action, people:</p>
      <label><input type="radio" name="story-6-q4" value="wrong"> Knocked the castle down</label><br>
      <label><input type="radio" name="story-6-q4" value="correct"> Admired both sandcastles</label><br>
      <label><input type="radio" name="story-6-q4" value="wrong"> Began complaining</label><br>
    </div>
    <div class="quiz-question">
      <p>5. Finally, they decided:</p>
      <label><input type="radio" name="story-6-q5" value="wrong"> Only Jenna was the winner</label><br>
      <label><input type="radio" name="story-6-q5" value="correct"> Both won and shared ice cream</label><br>
      <label><input type="radio" name="story-6-q5" value="wrong"> No one had fun</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-6')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-6-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-5')">&laquo; Back</button>
    <button class="btn" id="story-6-next" onclick="showStory('story-7')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 7 -->
<div id="story-7" class="story-container">
  <h2>Story 7: "Tom's Tall Treehouse"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-7-draggables">
    <div class="draggable" draggable="true" data-part="introduction" data-text="Tom wanted a secret place high in the oak tree behind his house.">
      Tom wanted a secret place high in the oak tree behind his house.
    </div>
    <div class="draggable" draggable="true" data-part="rising" data-text="He gathered wood and tools, drawing a plan for a sturdy treehouse.">
      He gathered wood and tools, drawing a plan for a sturdy treehouse.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="Tom relaxed in his cozy new hideout, proud of his accomplishment.">
      Tom relaxed in his cozy new hideout, proud of his accomplishment.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="He steadied himself, finished the roof, and climbed into the treehouse safely.">
      He steadied himself, finished the roof, and climbed into the treehouse safely.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="While hammering the final plank, the ladder shook, and Tom nearly dropped his hammer!">
      While hammering the final plank, the ladder shook, and Tom nearly dropped his hammer!
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-7-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-7')">Submit</button>
  </div>
  <div class="congratulations" id="story-7-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-7-quiz">
    <h3>Quiz: "Tom's Tall Treehouse"</h3>
    <div class="quiz-question">
      <p>1. Why did Tom want a treehouse?</p>
      <label><input type="radio" name="story-7-q1" value="wrong"> He wanted to sell wood</label><br>
      <label><input type="radio" name="story-7-q1" value="correct"> He wanted a secret spot high in the oak tree</label><br>
      <label><input type="radio" name="story-7-q1" value="wrong"> He was afraid of the ground</label><br>
    </div>
    <div class="quiz-question">
      <p>2. He prepared by:</p>
      <label><input type="radio" name="story-7-q2" value="wrong"> Taking a nap</label><br>
      <label><input type="radio" name="story-7-q2" value="wrong"> Tying a rope swing</label><br>
      <label><input type="radio" name="story-7-q2" value="correct"> Gathering wood, tools, and making a plan</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The tense moment was when:</p>
      <label><input type="radio" name="story-7-q3" value="correct"> He almost fell off the ladder while hammering</label><br>
      <label><input type="radio" name="story-7-q3" value="wrong"> The tree vanished</label><br>
      <label><input type="radio" name="story-7-q3" value="wrong"> He couldn't find any nails</label><br>
    </div>
    <div class="quiz-question">
      <p>4. During the falling action, Tom:</p>
      <label><input type="radio" name="story-7-q4" value="wrong"> Quit building it halfway</label><br>
      <label><input type="radio" name="story-7-q4" value="correct"> Steadied himself and finished the roof</label><br>
      <label><input type="radio" name="story-7-q4" value="wrong"> Gave away the wood</label><br>
    </div>
    <div class="quiz-question">
      <p>5. In the end, Tom:</p>
      <label><input type="radio" name="story-7-q5" value="wrong"> Sold his treehouse</label><br>
      <label><input type="radio" name="story-7-q5" value="correct"> Relaxed in his new hideout</label><br>
      <label><input type="radio" name="story-7-q5" value="wrong"> Moved to another house</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-7')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-7-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-6')">&laquo; Back</button>
    <button class="btn" id="story-7-next" onclick="showStory('story-8')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 8 -->
<div id="story-8" class="story-container">
  <h2>Story 8: "Ava and the Hidden Treasure"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-8-draggables">
    <div class="draggable" draggable="true" data-part="rising" data-text="She hiked into the forest, following the map's clues through twisty paths.">
      She hiked into the forest, following the map's clues through twisty paths.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="Ava returned home happily, planning to share the treasure's story with her family.">
      Ava returned home happily, planning to share the treasure's story with her family.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Ava discovered an old map in her grandmother's attic, marking a treasure spot in the woods.">
      Ava discovered an old map in her grandmother's attic, marking a treasure spot in the woods.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="Carefully prying it open, she found old coins and a handwritten letter.">
      Carefully prying it open, she found old coins and a handwritten letter.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="At a giant oak tree, she dug into the ground and heard a loud thud — she hit a wooden box!">
      At a giant oak tree, she dug into the ground and heard a loud thud — she hit a wooden box!
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-8-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-8')">Submit</button>
  </div>
  <div class="congratulations" id="story-8-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-8-quiz">
    <h3>Quiz: "Ava and the Hidden Treasure"</h3>
    <div class="quiz-question">
      <p>1. Where did Ava find the map?</p>
      <label><input type="radio" name="story-8-q1" value="wrong"> Under her bed</label><br>
      <label><input type="radio" name="story-8-q1" value="correct"> In her grandmother's attic</label><br>
      <label><input type="radio" name="story-8-q1" value="wrong"> At a bookstore</label><br>
    </div>
    <div class="quiz-question">
      <p>2. She followed the map's clues in:</p>
      <label><input type="radio" name="story-8-q2" value="wrong"> A busy city street</label><br>
      <label><input type="radio" name="story-8-q2" value="correct"> The forest</label><br>
      <label><input type="radio" name="story-8-q2" value="wrong"> Her backyard</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The climax occurred when:</p>
      <label><input type="radio" name="story-8-q3" value="wrong"> Ava got lost</label><br>
      <label><input type="radio" name="story-8-q3" value="correct"> She hit a wooden box while digging under a giant oak</label><br>
      <label><input type="radio" name="story-8-q3" value="wrong"> She decided to go home empty-handed</label><br>
    </div>
    <div class="quiz-question">
      <p>4. Inside the box, Ava found:</p>
      <label><input type="radio" name="story-8-q4" value="wrong"> Toys and candy</label><br>
      <label><input type="radio" name="story-8-q4" value="wrong"> A bouquet of flowers</label><br>
      <label><input type="radio" name="story-8-q4" value="correct"> Old coins and a letter</label><br>
    </div>
    <div class="quiz-question">
      <p>5. Finally, she:</p>
      <label><input type="radio" name="story-8-q5" value="correct"> Went home and planned to share the treasure's story</label><br>
      <label><input type="radio" name="story-8-q5" value="wrong"> Threw the treasure away</label><br>
      <label><input type="radio" name="story-8-q5" value="wrong"> Lost the map again</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-8')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-8-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-7')">&laquo; Back</button>
    <button class="btn" id="story-8-next" onclick="showStory('story-9')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 9 -->
<div id="story-9" class="story-container">
  <h2>Story 9: "Oliver's Rocket Adventure"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-9-draggables">
    <div class="draggable" draggable="true" data-part="rising" data-text="He tested the engine multiple times, adjusting the fuel mixture carefully.">
      He tested the engine multiple times, adjusting the fuel mixture carefully.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Oliver built a small rocket in his backyard, dreaming of a short flight.">
      Oliver built a small rocket in his backyard, dreaming of a short flight.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="The rocket parachute deployed, and it drifted gently back to the ground.">
      The rocket parachute deployed, and it drifted gently back to the ground.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="Oliver cheered, excited to build even bigger rockets in the future.">
      Oliver cheered, excited to build even bigger rockets in the future.
    </div>
    <div class="draggable" draggable="true" data-part="climax" data-text="On launch day, he pressed the button, and the rocket blasted off into the sky!">
      On launch day, he pressed the button, and the rocket blasted off into the sky!
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-9-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-9')">Submit</button>
  </div>
  <div class="congratulations" id="story-9-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-9-quiz">
    <h3>Quiz: "Oliver's Rocket Adventure"</h3>
    <div class="quiz-question">
      <p>1. What did Oliver build?</p>
      <label><input type="radio" name="story-9-q1" value="wrong"> A toy car</label><br>
      <label><input type="radio" name="story-9-q1" value="correct"> A small rocket</label><br>
      <label><input type="radio" name="story-9-q1" value="wrong"> A robot</label><br>
    </div>
    <div class="quiz-question">
      <p>2. He tested the engine by:</p>
      <label><input type="radio" name="story-9-q2" value="correct"> Adjusting the fuel mixture carefully</label><br>
      <label><input type="radio" name="story-9-q2" value="wrong"> Throwing it in water</label><br>
      <label><input type="radio" name="story-9-q2" value="wrong"> Putting it in a toy car</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The climax was when:</p>
      <label><input type="radio" name="story-9-q3" value="wrong"> The rocket refused to start</label><br>
      <label><input type="radio" name="story-9-q3" value="wrong"> Oliver lost the rocket</label><br>
      <label><input type="radio" name="story-9-q3" value="correct"> The rocket took off into the sky</label><br>
    </div>
    <div class="quiz-question">
      <p>4. After the rocket launched, it:</p>
      <label><input type="radio" name="story-9-q4" value="wrong"> Disappeared forever</label><br>
      <label><input type="radio" name="story-9-q4" value="correct"> Floated down with a parachute</label><br>
      <label><input type="radio" name="story-9-q4" value="wrong"> Burst into flames</label><br>
    </div>
    <div class="quiz-question">
      <p>5. Oliver ended up:</p>
      <label><input type="radio" name="story-9-q5" value="wrong"> Sad he ever tried</label><br>
      <label><input type="radio" name="story-9-q5" value="correct"> Cheering and planning bigger rockets</label><br>
      <label><input type="radio" name="story-9-q5" value="wrong"> Throwing the rocket away</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-9')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-9-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-8')">&laquo; Back</button>
    <button class="btn" id="story-9-next" onclick="showStory('story-10')">Next &raquo;</button>
  </div>
</div>

<!-- STORY 10 -->
<div id="story-10" class="story-container">
  <h2>Story 10: "Ella's Enchanted Shoes"</h2>
  <p style="text-align:center;"><strong>Drag each part into the correct slot!</strong></p>
  <div class="parts-container" id="story-10-draggables">
    <div class="draggable" draggable="true" data-part="climax" data-text="Suddenly, the shoes sparkled brightly, and Ella found she could twirl without getting dizzy.">
      Suddenly, the shoes sparkled brightly, and Ella found she could twirl without getting dizzy.
    </div>
    <div class="draggable" draggable="true" data-part="falling" data-text="She spun around the yard, amazed at how light her feet felt.">
      She spun around the yard, amazed at how light her feet felt.
    </div>
    <div class="draggable" draggable="true" data-part="rising" data-text="She slipped them on, feeling a strange tingle, and went outside to dance.">
      She slipped them on, feeling a strange tingle, and went outside to dance.
    </div>
    <div class="draggable" draggable="true" data-part="resolution" data-text="Finally, she stepped back inside, thanked her grandmother, and promised to share the magic with her friends.">
      Finally, she stepped back inside, thanked her grandmother, and promised to share the magic with her friends.
    </div>
    <div class="draggable" draggable="true" data-part="introduction" data-text="Ella discovered a pair of glittery shoes in her grandmother's closet.">
      Ella discovered a pair of glittery shoes in her grandmother's closet.
    </div>
  </div>
  <div class="parts-container">
    <div>
      <div><strong>Introduction</strong>
        <span class="explanation-link" onclick="showHelpModal('introduction')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="introduction"></div>
    </div>
    <div>
      <div><strong>Rising Action</strong>
        <span class="explanation-link" onclick="showHelpModal('rising')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="rising"></div>
    </div>
    <div>
      <div><strong>Climax</strong>
        <span class="explanation-link" onclick="showHelpModal('climax')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="climax"></div>
    </div>
    <div>
      <div><strong>Falling Action</strong>
        <span class="explanation-link" onclick="showHelpModal('falling')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="falling"></div>
    </div>
    <div>
      <div><strong>Resolution</strong>
        <span class="explanation-link" onclick="showHelpModal('resolution')">[What is this?]</span>
      </div>
      <div class="dropzone" data-accept="resolution"></div>
    </div>
  </div>
  <div class="hint" id="story-10-hint" style="display:none;">Oops! One or more parts are incorrect.</div>
  <div style="text-align:center;">
    <button class="btn" onclick="checkAnswers('story-10')">Submit</button>
  </div>
  <div class="congratulations" id="story-10-congrats">Congratulations! You placed all parts correctly!</div>
  <div class="quiz-container" id="story-10-quiz">
    <h3>Quiz: "Ella's Enchanted Shoes"</h3>
    <div class="quiz-question">
      <p>1. Where did Ella find the shoes?</p>
      <label><input type="radio" name="story-10-q1" value="wrong"> In her attic</label><br>
      <label><input type="radio" name="story-10-q1" value="wrong"> In a box by the street</label><br>
      <label><input type="radio" name="story-10-q1" value="correct"> In her grandmother's closet</label><br>
    </div>
    <div class="quiz-question">
      <p>2. When she put them on, she felt:</p>
      <label><input type="radio" name="story-10-q2" value="wrong"> Very tired</label><br>
      <label><input type="radio" name="story-10-q2" value="correct"> A strange tingle</label><br>
      <label><input type="radio" name="story-10-q2" value="wrong"> Nothing special</label><br>
    </div>
    <div class="quiz-question">
      <p>3. The climax was when:</p>
      <label><input type="radio" name="story-10-q3" value="correct"> The shoes sparkled and she could twirl without getting dizzy</label><br>
      <label><input type="radio" name="story-10-q3" value="wrong"> She tripped over a rock</label><br>
      <label><input type="radio" name="story-10-q3" value="wrong"> The shoes fell apart</label><br>
    </div>
    <div class="quiz-question">
      <p>4. After the shoes sparkled, Ella:</p>
      <label><input type="radio" name="story-10-q4" value="wrong"> Took them off immediately</label><br>
      <label><input type="radio" name="story-10-q4" value="correct"> Spun around the yard, amazed</label><br>
      <label><input type="radio" name="story-10-q4" value="wrong"> Hid the shoes</label><br>
    </div>
    <div class="quiz-question">
      <p>5. In the end, Ella:</p>
      <label><input type="radio" name="story-10-q5" value="wrong"> Kept the magic a secret</label><br>
      <label><input type="radio" name="story-10-q5" value="correct"> Thanked her grandmother and promised to share the magic</label><br>
      <label><input type="radio" name="story-10-q5" value="wrong"> Sold the shoes</label><br>
    </div>
    <div style="text-align:center;">
      <button class="btn" onclick="submitQuiz('story-10')">Submit Quiz</button>
    </div>
    <div class="score-message" id="story-10-score"></div>
  </div>
  <div class="navigation-buttons">
    <button class="btn" onclick="showStory('story-9')">&laquo; Back</button>
    <button class="btn" id="story-10-next" onclick="showStory('final-message')">Finish &raquo;</button>
  </div>
</div>
`;