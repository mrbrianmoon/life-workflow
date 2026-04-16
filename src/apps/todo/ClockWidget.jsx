import { useEffect } from 'react';
import styles from './ClockWidget.module.css';

const WIDGET_ID = 'dayspedia_widget_13e1fcb8e5b558c4';

export default function ClockWidget() {
  useEffect(function() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.dayspedia.com/js/dwidget.min.vc84b5f7d.js';
    script.onload = function() {
      if (window.DigitClock) {
        window.dwidget = new window.DigitClock();
        window.dwidget.init(WIDGET_ID);
      }
    };
    document.body.appendChild(script);

    return function() {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div
        className="DPDC"
        cityid="5645"
        lang="en"
        id={WIDGET_ID}
        host="https://dayspedia.com"
        ampm="true"
        nightsign="true"
        sun="false"
      >
        <style>{`
          .DPDC{display:table;position:relative;box-sizing:border-box;font-size:100.01%;font-style:normal;font-family:Arial;background-position:50% 50%;background-repeat:no-repeat;background-size:cover;overflow:hidden;user-select:none}
          .DPDCh,.DPDCd{width:fit-content;line-height:1.4}
          .DPDCh{margin-bottom:1em}
          .DPDCd{margin-top:.24em}
          .DPDCt{line-height:1}
          .DPDCth,.DPDCtm,.DPDCts{display:inline-block;vertical-align:text-top;white-space:nowrap}
          .DPDCth{min-width:0.6em;text-align:right}
          .DPDCtm,.DPDCts{min-width:1.44em}
          .DPDCtm::before,.DPDCts::before{display:inline-block;content:':';vertical-align:middle;margin:-.34em 0 0 -.07em;width:.32em;text-align:center;opacity:.72;filter:alpha(opacity=72)}
          .DPDCt12{display:inline-block;vertical-align:baseline;top:-0.12em;position:relative;font-size:40%}
          .DPDCdm::after{content:' '}
          .DPDCda::after{content:', '}
          .DPDCdt{margin-right:.48em}
          .DPDCtn{display:inline-block;position:relative;width:13px;height:13px;border:2px solid;border-radius:50%;overflow:hidden}
          .DPDCtn>i{display:block;content:'';position:absolute;right:33%;top:-5%;width:85%;height:85%;border-radius:50%}
          .DPDCs{margin:.96em 0 0 -3px;font-size:90%;line-height:1;white-space:nowrap}
          .DPDCs sup{padding-left:.24em;font-size:65%}
          .DPDCsl::before,.DPDCsl::after{display:inline-block;opacity:.4}
          .DPDCsl::before{content:'~';margin:0 .12em}
          .DPDCsl::after{content:'~';margin:0 .24em}
          .DPDCs svg{display:inline-block;vertical-align:bottom;width:1.2em;height:1.2em;opacity:.48}
        `}</style>
        <a className="DPl" href="https://dayspedia.com/time/us/Indiana/" target="_blank" rel="noreferrer"></a>
        <div className="DPDCh">Current Time in Indiana</div>
        <div className="DPDCt">
          <span className="DPDCth">12</span>
          <span className="DPDCtm">00</span>
          <span className="DPDCts">00</span>
          <span className="DPDCt12">pm</span>
        </div>
        <div className="DPDCd">
          <span className="DPDCdt">Loading...</span>
          <span className="DPDCtn" style={{ display: 'none' }}><i></i></span>
        </div>
        <div className="DPDCs" style={{ display: 'none' }}></div>
      </div>
    </div>
  );
}
