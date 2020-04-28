const { assert, expect } = require('chai');
const util = require('../util');
const pupBrowser = require('./testBoot');

describe('extension utility functions', function() {
  this.timeout(20000); // default is 2 seconds and that may not be enough to boot browsers and pages.

  before(async function() {
    await pupBrowser.launchBrowser();
  });
  after(async function() {
    await pupBrowser.browser.close();
  });

  describe('chinese finder function', () => {
    it.only('identifies chinese text on page', () => {
      const language = "Chinese";
      const expected = "聲我度都，一可文行知化，演人去，北醫進方會說多員校工能廣歷學接想有國詩法今不同……象中之司呢功度，的長集走在卻實報後間曾來放官……人證思念在我為投一越間例少臉管的的房跟衣。" + "\n\n" + " 一觀本天相法使倒國機知：保裡大受文部山回代著願我一才。達雲的眾究遊道可之。上何驗友史然，資格面山地機機功思書落呢報就一始十心自成。" + "\n\n" + "體有傳如景出功子明山們預，成小達，的景時開心道這這首。是光見影得因主，觀利家水起北定起風實領意，見示而：是黨怎分：賽這多國！上地小無主力不，能遠多力人綠的開故，水品本工化設代列得裡座則完性坡到那因活不資提眼深有備，夜安親時遊前式中！是港為，媽臺期子作子國通成，變寶到來得子聞；動毛畫公知而油只家會客程力常大，不音洲；小父它重媽上，光流到我雖的報。";
  
      pupBrowser.testTextPage.bringToFront();
      const result = util.getLangText(pupBrowser.testTextPage, language);

      expect(result).to.equal(expected);
    })
    it('changes size of chinese text', () => {
      
    })
    it('doesnt change the size of english text', () => {
  
    })
  })
})
