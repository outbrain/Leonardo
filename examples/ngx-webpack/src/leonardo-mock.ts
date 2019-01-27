import Leonardo from 'leonardojs';

export function registerLeonardo () {
  Leonardo.addState({
    name: 'Get Comments',
    verb: 'GET',
    url: 'api/comments',
    options: [
      {
        "name": "Success",
        "status": 200,
        "delay": 500,
        "data": [
            {
              "keyword": "mexican women in politics",
              "articles": 1,
              "lastArticle": {
                "title": "‘A hole in our hearts’: A 15-year-old girl lost to MS-13 is laid to rest",
                "url": "https://www.washingtonpost.com/local/a-hole-in-our-hearts-a-15-year-old-girl-lost-to-ms-13-is-laid-to-rest/2017/03/23/1aae66b4-0ff6-11e7-9d5a-a83e627dc120_story.html",
                "source": "www.washingtonpost.com"
              }
            },
            {
              "keyword": "parasites of birds",
              "articles": 1,
              "lastArticle": {
                "title": "Stuck in traffic? Just fly away (some day)",
                "url": "http://money.cnn.com/2017/03/09/luxury/flying-car-italdesign-airbus/index.html",
                "source": "money.cnn.com"
              }
            },
            {
              "keyword": "members of the chamber of deputies mexico",
              "articles": 1,
              "lastArticle": {
                "title": "‘A hole in our hearts’: A 15-year-old girl lost to MS-13 is laid to rest",
                "url": "https://www.washingtonpost.com/local/a-hole-in-our-hearts-a-15-year-old-girl-lost-to-ms-13-is-laid-to-rest/2017/03/23/1aae66b4-0ff6-11e7-9d5a-a83e627dc120_story.html",
                "source": "www.washingtonpost.com"
              }
            },
            {
              "keyword": "united states state health legislation",
              "articles": 1,
              "lastArticle": {
                "title": "The CBO's other bombshell: the Affordable Care Act isn't imploding",
                "url": "http://www.vox.com/policy-and-politics/2017/3/14/14921594/obamacare-implosion-ahca",
                "source": "www.vox.com"
              }
            },
            {
              "keyword": "el salvador",
              "articles": 1,
              "lastArticle": {
                "title": "‘A hole in our hearts’: A 15-year-old girl lost to MS-13 is laid to rest",
                "url": "https://www.washingtonpost.com/local/a-hole-in-our-hearts-a-15-year-old-girl-lost-to-ms-13-is-laid-to-rest/2017/03/23/1aae66b4-0ff6-11e7-9d5a-a83e627dc120_story.html",
                "source": "www.washingtonpost.com"
              }
            },
            {
              "keyword": "devin nunes",
              "articles": 1,
              "lastArticle": {
                "title": "How Congress responded to Trump's request to investigate the Obama administration",
                "url": "http://edition.cnn.com/2017/03/05/politics/white-house-spicer-congress-2016/index.html",
                "source": "edition.cnn.com"
              }
            },
            {
              "keyword": "james comey",
              "articles": 1,
              "lastArticle": {
                "title": " Trump taps hardliners for national security team",
                "url": "http://edition.cnn.com/2016/11/18/politics/donald-trump-national-security-team-sessions-flynn-pompeo/index.html",
                "source": "edition.cnn.com"
              }
            },
            {
              "keyword": "mick mulvaney",
              "articles": 1,
              "lastArticle": {
                "title": "The CBO's other bombshell: the Affordable Care Act isn't imploding",
                "url": "http://www.vox.com/policy-and-politics/2017/3/14/14921594/obamacare-implosion-ahca",
                "source": "www.vox.com"
              }
            }
          ],
        }
    ]
  })
}
