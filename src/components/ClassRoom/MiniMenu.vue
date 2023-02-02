<template>
<GridLayout ref="miniMenuBox" rows="*,auto" columns="24,auto,*"  >

<!---------------------------------------------------------------------------------------->

    <GridLayout rows="50,*" col=1 row=1 class="buttonsBox" ref="buttonsBox" >

        <nButton 
            ref="luncherButton" 
            :myLabel="String.fromCharCode( '0x' + u.label )" 
            :myClass=u.class 
            @tap=u.func 
        />

        <StackLayout rowSpan=2 ref="controlBox" paddingTop=15 >

            <nButton 
                v-for="(button,i) in controlBtn"
                :key=i
                :myLabel="String.fromCharCode( '0x' + button.label )"
                :myClass="'fas controlButton ' + button.class" 
                @tap=button.func 
            />

        </StackLayout>

    </GridLayout>

<!---------------------------------------------------------------------------------------->

    <!-- <FontsBox ref="fontsBox" col=2 row=1 /> -->

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import * as TM                          from "@/mixins/themeManager"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import * as tools                       from "@/mixins/tools"
// import FontsBox                         from "@/components/ClassRoom/FontsBox.vue"
import Bus                              from "@/mixins/bus"
import * as storage                     from "@/mixins/storageHandler"
import * as tnsPLY                      from "@/mixins/audioPlayer"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class MiniMenu extends Vue {

// -- =====================================================================================

box_animation;
expanded = true;
controlBtn: { [key: string] : { label: string, class: string, func: object } } = null;

ControlBase : { [key: string] : { label: string, class: string, func: object } } = {
                                                                                       
    Play:     { label: "f04b", class: "play",   func: () => this.play()             } ,
    Pause:    { label: "f04c", class: "",       func: () => tnsPLY.pause()          } ,
    Speed:    { label: "f6ec", class: "",       func: () => this.speedToggler()     } ,
    DarkMode: { label: "f042", class: "theme",  func: () => this.darkModeToggler()  } ,
    Font:     { label: "41",   class: "",       func: () => this.fontPallet()       } ,
    Skip:     { label: "f472", class: 'skip',   func: () => this.skip()          } ,
    Confirm:  { label: "f559", class: 'confirm',func: () => this.confirm()          } ,
                                                                                       
}

u = {
    label : "f077",
    class : "fas luncherButton",
    func  : () => { this.launcher() }
}

speeds = [ 
    { icon: "f722", value: 0.5  },
    { icon: "f6ec", value: 0.75 },
    { icon: "f554", value: 1    },
    { icon: "f70c", value: 1.5  },
    { icon: "f7c9", value: 1.75 },
    { icon: "f533", value: 2    }
];
speedMode = 2;


// -- =====================================================================================

mounted () {

    this.expanded = false;

    Bus.$on( "MiniMenu_MiniMenu", this.miniMenu );

    store.watch(
        state => state.mediaState,
        newVal => this.controlButtons( newVal )
    );

}


// -- =====================================================================================

controlButtons ( mode: TS.mediaState, omit?: string[] ): number {

    if ( omit ) for( let x of omit ) delete this.ControlBase[x];

    this.controlBtn = { ...this.ControlBase };

    try { this.controlBtn.Speed.label = this.speeds[ this.speedMode ].icon } catch {}

    if ( mode === "playing" ) delete this.controlBtn[ 'Play' ];
    else delete this.controlBtn[ 'Pause' ];

    return Object.keys( this.controlBtn ).length * 40;

}

// -- =====================================================================================

async init (): Promise<void> {

    return new Promise ( async rs => {

        let exp = this.controlButtons( "stopped" );

        await new Promise( _ => setTimeout( _, 0 ) );

        let buttonsBox = ( this.$refs.buttonsBox as any ).nativeView;

        if ( buttonsBox.getActualSize().height < exp ) rs ( this.init() );

        else {

            let bgColor = store.state.darkMode ? '#00043a3a' : '#002eacc9';

            buttonsBox.translateY = buttonsBox.getActualSize().height -50;
            buttonsBox.backgroundColor = bgColor;

            ( this.$refs.controlBox as any ).nativeView.visibility = "hidden"; 

            rs();

        }

    } )


}

// -- =====================================================================================

launcher () { 
    if ( !this.expanded ) {
        this.miniMenu();
        this.autoCollapse( 3600 );
    }
}

// -- =====================================================================================

play () {

    let audio = store.state.inHand.mediaPath;

    if ( audio ) {
        if ( tnsPLY.playerOptions.audioFile !== audio ) tnsPLY.init( audio );
        tnsPLY.play();
    }

    // .. NO FILE ASSIGNED (YET!) !
    else tools.toaster( "NO AUDIO!", "short" );

}

// -- =====================================================================================

fontPallet () {
    // ! checkkkk
    // ( this.$refs.fontsBox as FontsBox ).pallet( true );
}

// -- =====================================================================================

showOff_TO: NodeJS.Timeout | any;
showOff () {
    this.autoCollapse( 100 );
    this.showOff_TO = setTimeout( () => this.autoCollapse( 900 ), 800 );
}

// -- =====================================================================================

box_TO: NodeJS.Timeout | any;
autoCollapse ( time = -1 ) {
    if ( this.box_TO ) clearTimeout( this.box_TO );
    if ( time > -1 ) this.box_TO = setTimeout( () => this.miniMenu(), time );
}

// -- =====================================================================================

miniMenu ( time=300 , forceMode?: "up" | "down" ) {

    if ( this.box_TO ) clearTimeout( this.box_TO );
    if ( this.box_animation ) if ( forceMode !== "down" ) this.box_animation.cancel();

    let box = ( this.$refs.buttonsBox as any ).nativeView,
        luncherButton = ( this.$refs.luncherButton as any ).nativeView,
        controlBox = ( this.$refs.controlBox as any ).nativeView; 

    let o_def: NS.AnimationDefinition = {},
        o2_def: NS.AnimationDefinition = {},
        o3_def: NS.AnimationDefinition = {};

    o_def.target    = box;
    o_def.duration  = time;

    o2_def.target   = luncherButton;
    o2_def.duration = time;

    o3_def.target   = controlBox;

    // .. collapsing
    if ( this.expanded || ( forceMode === "down" ) ) {

        o_def.backgroundColor = store.state.darkMode ? 
            new NS.Color( "#00043a3a" ) :
            new NS.Color( "#002eacc9" ); 

        o_def.translate = { x:0, y: box.getActualSize().height -50 };
        o_def.opacity   = .3;
        o_def.duration  = time +150;
        o_def.delay     = 450;

        o2_def.opacity  = 1;
        o3_def.opacity  = 0;
        o3_def.duration = 200;

        this.box_animation = new NS.Animation( [ o_def, o2_def, o3_def ], false );
        this.box_animation.play().then( () => { 
            this.expanded = false;
            controlBox.visibility = "hidden";
        } );

    }

    // .. expanding
    else if ( !this.expanded || ( forceMode === "up" )  ) {

        o_def.backgroundColor = store.state.darkMode ? 
            new NS.Color( "#043a3a" ) :
            new NS.Color( "#2eacc9" ); 

        o_def.translate = { x:0, y: 0 };
        o_def.opacity   = 1;

        o2_def.opacity  = 0;
        o3_def.opacity  = 1;
        o3_def.duration = time;

        controlBox.visibility = 'visible';
        this.box_animation = new NS.Animation( [ o_def, o2_def, o3_def ], false );
        this.box_animation.play().then( () => this.expanded = true );

    }

}

// -- =====================================================================================

speedToggler () { 

    this.speedMode = ( this.speedMode +1 ) % this.speeds.length;
    tnsPLY.gearSpeed( this.speeds[ this.speedMode ].value );
    this.autoCollapse( 3600 );

}

// -- =====================================================================================

darkModeToggler () { 

    let box = ( this.$refs.buttonsBox as any ).nativeView; 

    TM.darkModeToggler( this.$root.$children[0].$refs );

    box.backgroundColor = store.state.darkMode ? 
        new NS.Color( "#043a3a" ) : new NS.Color( "#2eacc9" );

    this.autoCollapse( 500 );

}

// -- =====================================================================================

confirm_TO: NodeJS.Timeout | any;
confirm () {

    // .. step 2
    if( this.confirm_TO ) {

        clearTimeout( this.confirm_TO );

        tools.confirmLesson( store.state.inHand.lesson );
        ( this as any ).$navigateBack();
        tools.dAO( store.state.inHand.institute );

    }
    // .. step 1
    else {

        if ( store.state.inHand.lesson.chromosome.status === "read" ) {
            tools.toaster( "Already Confirmed!", "short" );
            return 0;
        }

        tools.toaster( "Press Again to Confirm as Read!", "short" );
        this.ControlBase.Confirm.class = "confirm pressed";

        this.confirm_TO = setTimeout( () => {
            this.confirm_TO = null;
            this.ControlBase.Confirm.class = "confirm";
        }, 1000 );

    }

}

// -- =====================================================================================

skip () {

    if ( store.state.inHand.lesson.chromosome.status === "skipped" ) {
        tools.toaster( "Already add to Skipped Lessons!", "short" );
        return 0;
    }

    tools.skipLesson( store.state.inHand.lesson );
    ( this as any ).$navigateBack();
    tools.dAO( store.state.inHand.institute );

}

// -- =====================================================================================

beforeDestroy () {
    this.autoCollapse(-1);
    if ( this.showOff_TO ) clearTimeout( this.showOff_TO );
    tnsPLY.stop();
}

// -- =====================================================================================

destroyed () {
    Bus.$off( "MiniMenu_MiniMenu" );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .buttonsBox {
        width: 50;
        padding: 0 0 10 0;
        border-radius: 6 6 0 0;
    }

    .fontsBox {
        height: 225;
        padding: 15;
        border-radius: 6 6 0 0;
    }

    .light .buttonsBox {
        background-color: #2eacc9;
    }

    .dark .buttonsBox {
        background-color: #043a3a;
    }

    .luncherButton {
        vertical-align: top;
        text-align: center;
        font-size: 35px;
        height: 100%;
        opacity: .3;
    }

    .light .luncherButton {
        color: #868686;
    }

    .dark .luncherButton {
        color: #808080;
    }

    .controlButton {
        vertical-align: center;
        color: #f2fcff;
        font-size: 23px;
        text-align: center;
        padding: 7 0;
        margin: 0;
    }

    .snap { color: #d13b27; }

    .light .theme { 
        color: #14131d; 
        transform: scale(-1);
    }

    .confirm { font-size: 27 }
    .light .confirm { color: #ffffff; }
    .dark  .confirm { color: #69a333; }

    .play {
        margin-left: -5;
    }

/*                                          */
    .light .pressed { background-color: rgba(41, 44, 48, 0.5) }
    .dark  .pressed { background-color: rgba(74, 76, 78, 0.5) }

</style>