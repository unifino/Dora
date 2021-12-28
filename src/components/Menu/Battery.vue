<template>
<GridLayout class="opt-item">

<!---------------------------------------------------------------------------------------->

    <nButton
        :myClass="'opt-item fas rotate ' + batteryStatus.iconColor"
        :myLabel="String.fromCharCode( '0x' + batteryStatus.icon )"
        @tap="plugItIn"
    />

    <Label 
        :text="batteryStatus.energy + ' %'"
        :class="'percent ' + batteryStatus.textColor"
    />

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"
import admob                            from "nativescript-admob";
import * as tools                       from "@/mixins/tools"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Battery extends Vue {

_TO: NodeJS.Timeout | any;

profiles = {
    init:   { icon: "f141", iconColor: "init",   textColor: "transparent" } ,
    error:  { icon: "f188", iconColor: "red",    textColor: "antiRed"     } ,
    empty:  { icon: "f244", iconColor: "red",    textColor: "orange"      } ,
    lvl_1:  { icon: "f243", iconColor: "orange", textColor: "orange"      } ,
    lvl_2:  { icon: "f242", iconColor: "blue",   textColor: "antiBlue"    } ,
    lvl_3:  { icon: "f241", iconColor: "blue",   textColor: "antiBlue"    } ,
    lvl_4:  { icon: "f240", iconColor: "blue",   textColor: "antiBlue"    } ,
    lvl_5:  { icon: "f240", iconColor: "green",  textColor: "antiGreen"   } ,
    plug:   { icon: "f1e6", iconColor: "green",  textColor: "antiGreen"   } ,
}

profile = { ...this.profiles.init, energy: 0 };

chargers: {
    normal  : "on" | "off" | "checking" ,
    fast    : "on" | "off" | "checking" ,
} = {
    fast    : "off" ,
    normal  : "off" ,
}

// -- =====================================================================================

get batteryStatus () {

    let battery = this.profile;

    if ( this.chargers.normal === "on" ) {
        battery.icon = this.profiles.plug.icon
        battery.iconColor = "blue"
        battery.textColor = "antiBlue"
    }

    if ( this.chargers.fast === "on" ) {
        battery.icon = this.profiles.plug.icon
        battery.iconColor = "green"
        battery.textColor = "antiGreen"
    }

    return battery;

}

// -- =====================================================================================

mounted () {
    Bus.$off( "Battery_update" );
    Bus.$on( "Battery_update", this.updateBattery );
    Bus.$off( "Battery_Init" );
    Bus.$on( "Battery_Init", this.init );
}

// -- =====================================================================================

init () {
    this.updateBattery().then( () => this.checkElectricity() );
}

// -- =====================================================================================

updateBattery ( electricity: number = 0 ): Promise<void> {

    return new Promise ( (rs, rx) => {

        let url = tools.ssd + 'getBattery';

        NS.Http.request( {
            url: url ,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            content: JSON.stringify( {
                e: store.state.appConfig.email,
                k: tools.key(),
                p: electricity,
            } )
        } )
        .then(
            res => {

                let x = res.content.toJSON() as TS.SSD_Res;

                if ( x.status === 200 ) {
                    let nrg = parseInt( x.answer as string ) ;
                    if ( nrg <  0  ) this.profile = { ...this.profiles.error, energy: -1  };
                    if ( nrg <= 15 ) this.profile = { ...this.profiles.empty, energy: nrg };
                    if ( nrg >  15 ) this.profile = { ...this.profiles.lvl_1, energy: nrg };
                    if ( nrg >  35 ) this.profile = { ...this.profiles.lvl_2, energy: nrg };
                    if ( nrg >  55 ) this.profile = { ...this.profiles.lvl_3, energy: nrg };
                    if ( nrg >  75 ) this.profile = { ...this.profiles.lvl_4, energy: nrg };
                    if ( nrg >= 99 ) this.profile = { ...this.profiles.lvl_5, energy: nrg };
                    if ( nrg > 100 ) this.profile = { ...this.profiles.error, energy: -1  };
                    rs();
                }
                else rx( this.profile = { ...this.profiles.error, energy: -1 } );

            },
            e => rx( this.profile = { ...this.profiles.error, energy: -1 } )
        )
        .catch( e => rx( this.profile = { ...this.profiles.error, energy: -1 } ) );

    } );

}

// -- =====================================================================================

normalCharger () {

    // this.chargers.normal = "checking";

    // admob.preloadInterstitial( {
    //     // testing: TNS_ENV !== 'production',
    //     androidInterstitialId: "ca-app-pub-3259580970520114/6200107920",
    //     keywords: [ "learn", "language", "fun", "entertainment" ], 
    // } ).
    // then( 
    //     () => this.chargers.normal = "on",
    //     err => this.chargers.normal = "off",
    // ).
    // catch( err => this.chargers.normal = "off" );

}

// -- =====================================================================================

fastCharger () {

    // this.chargers.fast = "checking";

    // admob.preloadRewardedVideoAd( {
    //     // testing: TNS_ENV !== 'production',
    //     androidAdPlacementId: "ca-app-pub-3259580970520114/3858027376",
    //     keywords: [ "learn", "language", "fun", "entertainment" ],
    // } ).
    // then( 
    //     () => this.chargers.fast = "on",
    //     err => this.chargers.fast = "off",
    // ).
    // catch( err => this.chargers.fast = "off" );

}

// -- =====================================================================================

plugItIn() {

    if ( this.profile.icon === this.profiles.error.icon ) {
        tools.toaster( "Restarting Battery ..." );
        this.init();
        return 0;
    }

    if ( this.chargers.fast === "on" ) this.charger( "fast" );
    else if ( this.chargers.normal === "on" ) this.charger( "normal" );
    else {
        this.checkElectricity();
        tools.toaster( "No Electricity!" )
    };

}

// -- =====================================================================================

checkElectricity_TO: NodeJS.Timeout | any;
checkingAttempt = 0;
checkElectricity() {

    if ( this.checkElectricity_TO ) clearTimeout( this.checkElectricity_TO );

    if ( this.profile.energy > -1 && this.profile.energy < 100 ) {
        if ( this.chargers.fast === "off" ) this.fastCharger();
        if ( this.chargers.normal === "off" ) this.normalCharger();
    }

    this.checkElectricity_TO = setTimeout( () => this.checkElectricity(), 600 * 1000 );

    if ( this.checkingAttempt > 9 ) {
        this.chargers.fast = "off";
        this.chargers.normal = "off";
        this.checkingAttempt = 0;
    }

    this.checkingAttempt ++;

}

// -- =====================================================================================

charger ( charger: "normal" | "fast" ) {

    if ( charger === "fast" ) {
        this.chargers.fast = "off";
        admob.showRewardedVideoAd( {
            onRewarded: power => this.updateBattery(5),
            onRewardedVideoAdClosed: () => this.init(),
        } )
    }

    if ( charger === "normal" ) {
        this.chargers.normal = "off";
        admob.showInterstitial().then(
            () => this.updateBattery(2),
            err => this.init(),
        )
    }

}

// -- =====================================================================================

destroyed () {
    if ( this._TO ) clearTimeout( this._TO );
    if ( this.checkElectricity_TO ) clearTimeout( this.checkElectricity_TO );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .percent {
        font-size: 11;
        font-weight: bold;;
        font-family: Farsan-Regular;
        vertical-align: middle;
        transform: rotate(90deg);
    }
    .light .percent     { color: #d1d1d1 }
    .dark  .percent     { color: #b2b4b6 }

    .light .init        { color: #95c5ce }
    .light .blue        { color: #0a4c83 }
    .light .orange      { color: #f06735 }
    .light .red         { color: #f03535 }
    .light .green       { color: #539912 }

    .dark  .init        { color: #747e80 }
    .dark  .blue        { color: #0169ad }
    .dark  .orange      { color: #d44714 }
    .dark  .red         { color: #991616 }
    .dark  .green       { color: #40770d }

    .light .transparent { color: transparent }
    .dark  .transparent { color: transparent }

    .light .antiRed     { color: #000000 }
    .dark  .antiRed     { color: #dddddd }
    .light .antiBlue    { color: #a8a8a8 }
    .dark  .antiBlue    { color: #cccccc }
    .light .antiGreen   { color: #e7e7e7 }
    .dark  .antiGreen   { color: #cccccc }

    .rotate {
        transform: rotate(-90deg);
    }

    .opt-item {
        font-size: 29;
    }

</style>