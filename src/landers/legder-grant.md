---
title: Legder Grant
slug: grantoffer/
---

<!DOCTYPE html>
<html lang="en">
<head>

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', '1284065979244898');
fbq('track', 'PageView');
</script>

<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1284065979244898&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b6b45">

<title>Application Check</title>

<style>

*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

html,
body{
  width:100%;
  min-height:100%;
}

body{
  min-height:100dvh;
  background:#f4f7f6;
  font-family:Arial,Helvetica,sans-serif;
  color:#17221d;
  -webkit-font-smoothing:antialiased;
}

button{
  font:inherit;
  -webkit-tap-highlight-color:transparent;
}

/* PAGE */

.page{
  min-height:100dvh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:14px;
}

/* CARD */

.card{
  width:100%;
  max-width:390px;
  background:#fff;
  border:1px solid #e1e8e4;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 12px 35px rgba(0,0,0,.08);
}

/* TOP */

.top{
  background:#0b6b45;
  color:#fff;
  text-align:center;
  padding:25px 20px 22px;
}

.icon{
  width:54px;
  height:54px;
  margin:0 auto 11px;
  border-radius:50%;
  background:#fff;
  color:#0b6b45;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:27px;
  font-weight:900;
}

.title{
  font-size:20px;
  line-height:1.2;
  font-weight:900;
  letter-spacing:-.2px;
}

.subtitle{
  margin-top:6px;
  font-size:11px;
  line-height:1.4;
  color:#d8f2e7;
  font-weight:600;
}

/* CONTENT */

.content{
  padding:25px 20px 22px;
  text-align:center;
}

/* STATUS */

.status-icon{
  width:68px;
  height:68px;
  margin:0 auto 16px;
  border-radius:50%;
  background:#edf8f3;
  color:#0b6b45;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:31px;
  font-weight:900;
  transition:.25s ease;
}

.status-icon.loading{
  color:transparent;
  border:4px solid #e2eee8;
  border-top-color:#0b6b45;
  animation:spin .75s linear infinite;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

/* TEXT */

.status-title{
  font-size:23px;
  line-height:1.15;
  font-weight:900;
  color:#17221d;
}

.status-text{
  margin-top:7px;
  font-size:12px;
  line-height:1.45;
  color:#718078;
}

/* PROGRESS */

.progress-wrap{
  margin:20px 0 17px;
}

.progress{
  width:100%;
  height:6px;
  background:#edf1ef;
  border-radius:20px;
  overflow:hidden;
}

.progress-bar{
  width:0%;
  height:100%;
  background:#0b6b45;
  border-radius:20px;
  transition:width .2s linear;
}

/* CHECK */

.check-list{
  display:flex;
  flex-direction:column;
  gap:9px;
  margin:18px 0;
}

.check-item{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  color:#4d5c55;
  font-size:11px;
  font-weight:700;
}

.check{
  width:17px;
  height:17px;
  border-radius:50%;
  background:#eaf7f1;
  color:#0b6b45;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
  font-weight:900;
}

/* SUPPORT */

.support{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin:18px 0 17px;
  padding:10px 12px;
  background:#f7faf8;
  border:1px solid #e4ebe7;
  border-radius:9px;
  color:#3f4e47;
  font-size:11px;
  font-weight:800;
}

.support-check{
  width:17px;
  height:17px;
  border-radius:4px;
  background:#0b6b45;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:10px;
}

/* CTA */

.cta{
  width:100%;
  height:54px;
  border:0;
  border-radius:11px;
  background:#075b3b;
  color:#fff;
  font-size:16px;
  font-weight:900;
  letter-spacing:.2px;
  cursor:pointer;
  box-shadow:0 5px 14px rgba(7,91,59,.18);
  transition:transform .1s ease,background .15s ease;
}

.cta:hover{
  background:#064e33;
}

.cta:active{
  transform:scale(.98);
}

.cta.hidden{
  display:none;
}

/* INITIAL STATE */

.result{
  display:none;
}

.result.show{
  display:block;
}

.checking{
  display:block;
}

.checking.hide{
  display:none;
}

/* SMALL PHONES */

@media(max-width:380px){

  .page{
    padding:8px;
  }

  .card{
    border-radius:16px;
  }

  .top{
    padding:20px 15px 18px;
  }

  .icon{
    width:45px;
    height:45px;
    font-size:22px;
    margin-bottom:8px;
  }

  .title{
    font-size:18px;
  }

  .content{
    padding:21px 15px 18px;
  }

  .status-icon{
    width:58px;
    height:58px;
    font-size:27px;
  }

  .status-title{
    font-size:21px;
  }

  .cta{
    height:51px;
    font-size:15px;
  }
}

</style>
</head>

<body>

<div class="page">

  <main class="card">

    <!-- HEADER -->

    <header class="top">

      <div class="icon">✓</div>

      <div class="title">
        APPLICATION CHECK
      </div>

      <div class="subtitle">
        Checking your application information
      </div>

    </header>


    <!-- MAIN -->

    <section class="content">

      <!-- CHECKING STATE -->

      <div class="checking" id="checkingState">

        <div class="status-icon loading" id="loadingIcon"></div>

        <div class="status-title">
          Checking...
        </div>

        <p class="status-text">
          Please wait while we check the information available.
        </p>

        <div class="progress-wrap">

          <div class="progress">
            <div
              class="progress-bar"
              id="progressBar">
            </div>
          </div>

        </div>

        <div class="check-list">

          <div class="check-item">
            <span class="check">✓</span>
            Application information
          </div>

          <div class="check-item">
            <span class="check">✓</span>
            Application availability
          </div>

        </div>

      </div>


      <!-- RESULT STATE -->

      <div class="result" id="resultState">

        <div class="status-icon">
          ✓
        </div>

        <div class="status-title">
          Check Complete
        </div>

        <p class="status-text">
          You're ready to continue.
        </p>

        <div class="support">

          <span class="support-check">
            ✓
          </span>

          REAL SUPPORT AVAILABLE

        </div>

        <button
          class="cta"
          id="applyButton"
          type="button">

          APPLY NOW

        </button>

      </div>

    </section>

  </main>

</div>


<script>

(function(){

  /*
   * DESTINATION URLS
   *
   * Replace these with the actual application/information
   * destinations you want visitors to reach.
   */

  const links = [
    "https://hire.spurblitz.com/how-to-hire-foreign-workers-legally/",
    "https://hire.spurblitz.com/how-to-apply-uk-skilled-worker-sponsor-licence/"
  ];


  /*
   * RANDOM URL
   */

  function randomUrl(){

    return links[
      Math.floor(Math.random() * links.length)
    ];

  }


  /*
   * INTERNAL EVENT
   */

  function fireEvent(eventName,data){

    window.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail:data
        }
      )
    );

    console.log(eventName,data);

  }


  /*
   * META PIXEL
   */

  function trackPixel(eventName,data){

    if(typeof fbq === "function"){

      fbq(
        "trackCustom",
        eventName,
        data || {}
      );

    }

  }


  /*
   * PAGE VIEW ALREADY FIRED ABOVE.
   *
   * Start the visual checking sequence.
   */

  const checkingState =
    document.getElementById("checkingState");

  const resultState =
    document.getElementById("resultState");

  const progressBar =
    document.getElementById("progressBar");

  const loadingIcon =
    document.getElementById("loadingIcon");


  /*
   * CHECKING ANIMATION
   *
   * Runs for approximately 1.8 seconds.
   */

  let progress = 0;

  const duration = 1800;

  const interval = 50;

  const increment =
    100 / (duration / interval);


  const progressTimer =
    setInterval(function(){

      progress += increment;

      if(progress >= 100){

        progress = 100;

        clearInterval(progressTimer);

        completeCheck();

      }

      progressBar.style.width =
        progress + "%";

    },interval);


  /*
   * COMPLETE CHECK
   */

  function completeCheck(){

    loadingIcon.classList.remove("loading");

    loadingIcon.textContent = "✓";

    checkingState.classList.add("hide");

    resultState.classList.add("show");


    fireEvent(
      "ApplicationCheckComplete",
      {
        status:"complete"
      }
    );


    trackPixel(
      "ApplicationCheckComplete",
      {
        status:"complete"
      }
    );

  }


  /*
   * APPLY NOW
   */

  document
    .getElementById("applyButton")
    .addEventListener("click",function(){

      const button = this;


      /*
       * Track CTA click before navigation.
       */

      fireEvent(
        "ApplyNowClicked",
        {
          destination_count:links.length
        }
      );


      trackPixel(
        "ApplyNowClicked",
        {
          destination_count:links.length
        }
      );


      /*
       * Prevent double clicks.
       */

      button.disabled = true;

      button.textContent =
        "OPENING...";


      /*
       * Give Meta Pixel a moment
       * to register the event.
       */

      setTimeout(function(){

        window.location.href =
          randomUrl();

      },250);

    });


})();

</script>

</body>
</html>
