import { GoogleAdMob } from "@apps-in-toss/web-framework";

export default class AdMob {
  constructor() {
    const adMob = GoogleAdMob.loadAppsInTossAdMob({
      options: {
        adGroupId: "ait-ad-test-rewarded-id",
      },
      onEvent: (event) => {
        switch (event.type) {
          case "loaded":
            break;
        }
      },
      onError: (error) => {
        console.error("광고 불러오기 실패", error);
      },
    });
  }
}
