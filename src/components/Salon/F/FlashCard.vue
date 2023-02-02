<template>
<Page>
<GridLayout rows="60,auto,60" columns="20,auto,*" >

<!---------------------------------------------------------------------------------------->

    <nButton
        row=0
        col=1
        myClass="dotButton fas p"
        @tap="speaker()"
        :myLabel="String.fromCharCode( '0x' + plyIcon )"
        :visibility=" !VIPSentence[1].isFake ? 'visible' : 'hidden' "
    />

<!---------------------------------------------------------------------------------------->

    <GridLayout
        row=1
        colSpan=3
        ref="bigBox"
        class="bigBox"
        :marginBottom="$store.state.mediaButtons ? 0 : 51.5"
        rows="18,auto,18,auto,auto,4"
        columns="15,*,15"
    >

<!---------------------------------------------------------------------------------------->

        <WrapLayout row=1 col=1 class="sentenceBox" >

            <nWord
                v-for="(word,i) in words"
                :key="i"
                :myText="word.text"
                :myClass="word.class"
                :refId=i
                :autoTranslate=true
                verticalAlignment="middle"
                @myLongPress=nWordLongPressed
            />

        </WrapLayout> 

<!---------------------------------------------------------------------------------------->

        <Label
            :visibility=" !VIPSentence[1].isFake ? 'visible' : 'hidden' "
            row=1
            col=1
            class="summeryBox"
        >

            <FormattedString>
                <Span
                    :text="String.fromCharCode( '0x' + summery.icon )"
                    :class="summery.class"
                />
            </FormattedString>

        </Label>

        <Label
            :visibility=" !VIPSentence[1].isFake ? 'visible' : 'hidden' "
            row=2
            col=1
            class="summeryStepBox"
            :text="summery.nextVisit"
        />

<!---------------------------------------------------------------------------------------->

        <GridLayout
            :visibility=" !VIPSentence[1].isFake ? 'visible' : 'collapsed' "
            row=3
            col=1
            class="buttonRow"
            marginBottom="13"
            columns="auto,auto,auto,*,auto,auto,auto"
        >

            <nButton
                v-for="(button,i) in buttonsRow1"
                :key="i"
                @tap="button.fnc1()"
                @long-press="button.fnc2()"
                :col="button.pos"
                :myLabel="String.fromCharCode( '0x' + button.label )"
                :myClass="'dotButton ' + button.class"
            />

            <Folder :myProp="folderProperty" col=6 />

        </GridLayout>

<!---------------------------------------------------------------------------------------->

        <StackLayout
            :visibility=" !VIPSentence[1].isFake && $store.state.mediaButtons ?
                'visible' : 'collapsed' "
            row=4
            col=1
            class="buttonRow"
            marginBottom="13"
            orientation="horizontal"
            horizontalAlignment="center"
        >

            <nButton
                v-for="(button,i) in buttonsRow2"
                :key="i"
                @tap="button.func()"
                :myLabel="String.fromCharCode( '0x' + button.label )"
                :myClass="'dotButton ' + button.class"
            />

        </StackLayout>

<!---------------------------------------------------------------------------------------->

    </GridLayout>

<!---------------------------------------------------------------------------------------->

</GridLayout>
</Page>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

import { Vue, Component, Prop }         from "vue-property-decorator"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import nWord                            from "@/components/tools/n_Word.vue"
import Folder                           from "@/components/tools/Folder.vue"
import * as tools                       from "@/mixins/tools"
import * as tnsPLY                      from "@/mixins/audioPlayer"
import Bus                              from "@/mixins/bus"

// -- =====================================================================================

@Component ( {
    components: { nButton, nWord, Folder }
} )

// -- =====================================================================================

export default class FlashCard extends Vue {

// -- =====================================================================================

@Prop() nextSlide;
@Prop() VIPSentence: TS.VIPSentence;

// -- =====================================================================================

folderProperty: TS.FolderProperty = { 
    title      : null,
    icon       : null,
    type       : "shortLink",
    path       : null,
    institute  : store.state.inHand.institute,
    lesson     : store.state.inHand.lesson
}

// -- =====================================================================================

buttonsRow1: {
    label:string,
    class:string,
    pos: number,
    fnc1: Function,
    fnc2: Function
} [] = [
                                                                                     
    { label: "f25b", class: "far g", pos:0,
        fnc1: () => { this.myAct('+') },
        fnc2: () => {} 
    },
    { label: "f256", class: "far r", pos:1,
        fnc1: () => { this.myAct('-')  },
        fnc2: () => {}
    },
    { label: "f070", class: "far x", pos:2,
        fnc1: () => { this.myAct('0') },
        fnc2: () => { this.myAct('x') }
    },
    { label: "f1ab", class: "fas b t", pos:5,
        fnc1: () => { this.translate() },
        fnc2: () => {}
    },
                                                                                     
    {                                                                                
        label: store.state.mediaButtons ? "f077" : "f078"                           ,
        class: "fas o"                                                              ,
        pos:4, 
        fnc1: () => {                                                         
            store.state.mediaButtons = !store.state.mediaButtons;                    
            this.buttonsRow1[4].label = store.state.mediaButtons ? "f077" : "f078";  
        },
        fnc2: () => {}                                                              ,
    }                                                                               ,
                                                                                     
];

buttonsRow2: { label:string, class:string, func: Function }[] = [
    { label: "f068", class: "fas y mini", func: () => { this.adjuster( "A", -.3  ) } } ,
    { label: "f068", class: "fas y",      func: () => { this.adjuster( "A", -1.9 ) } } ,
    { label: "2b",   class: "fas y",      func: () => { this.adjuster( "A", 1.9  ) } } ,
    { label: "2b",   class: "fas y mini", func: () => { this.adjuster( "A", .3   ) } } ,
    { label: ""  ,   class: 'space',      func: () => {}                             } ,
    { label: "f068", class: "fas b mini", func: () => { this.adjuster( "B", -.3  ) } } ,
    { label: "f068", class: "fas b",      func: () => { this.adjuster( "B", -1.9 ) } } ,
    { label: "2b",   class: "fas b",      func: () => { this.adjuster( "B", 1.9  ) } } ,
    { label: "2b",   class: "fas b mini", func: () => { this.adjuster( "B", .3   ) } } ,
];

plyIcon: "f04b" | "f2ea" = "f04b";

summery: any = { icon: "", class: "", nextVisit: "" }
myActiveBox = store.state.activeBox[ store.state.inHand.institute ];
myFlashcards = store.state.flssDB[ store.state.inHand.institute ];

// -- =====================================================================================

get words (): { text: string, class: string }[] {

    let words: { text: string, class: string }[] = [],
        item = this.VIPSentence[1];

    if ( !item.isFake ) {

        let ins = item.lesson.chromosome.institute,
            dText: TS.Organelle = item.lesson.protoplasm.find( x => x.type === "dText" );

        for ( let i = item.A; i <= item.B; i++ ) {
            let txt = dText.content[i][0];
            let cls = "parole";
            if ( tools.wordStating( txt, ins ) === "M" ) cls += " g";
            if ( dText.content[i][1].phrased === "blue" ) cls += " b";
            if ( dText.content[i][1].phrased === "red" ) cls += " r";
            if ( txt ) words.push( { text: txt, class: cls } );
        }

    }
    else words = [ { text: this.VIPSentence[0], class:"parole" } ];

    return words;

}

// -- =====================================================================================

mounted () {

    ( this.$refs.bigBox as any ).nativeView.marginBottom = store.state.mediaButtons ?
        0 : 51.5;

    try { this.myAct( this.VIPSentence[1].studyHistory.acted, false ) } catch {}

    if ( !this.VIPSentence[1].isFake ) this.speaker();

    store.state.preserve.flash = [];
    if ( !this.VIPSentence[1].isFake )
        for ( let i = this.VIPSentence[1].A; i <= this.VIPSentence[1].B; i++ )
            store.state.preserve.flash.push(i);

    // .. patch plyIcon icon
    store.watch(
        state => state.mediaState,
        newValue => this.plyIcon = newValue === "playing" ? "f2ea" : "f04b"
    );

}

// -- =====================================================================================

myAct ( action: TS.studyActions, apply=true ) {

    switch ( action ) {
        case '+': this.summery = { icon: "f00c", class: "fas summeryIcon g" }; break;
        case '-': this.summery = { icon: "f00d", class: "fas summeryIcon r" }; break;
        case '0': tools.toaster( 'Long Press to Delete!' ); return;
        case 'x': tools.toaster( 'Deleted!' ); break;
    }

    try {
        let baseTime = store.state.appConfig.baseTime;
        let days = this.VIPSentence[1].studyHistory.newStep ** baseTime;
        this.summery.nextVisit = "next visit: " + days + " Days";
    } catch {}

    if ( apply ) this.studyAct( action );

}

// -- =====================================================================================

async adjuster ( point: 'A' | 'B' , fac: -.3 | .3 | -1.9 | 1.9 ) {

    let factor = .25,
        item = this.VIPSentence[1],
        uContext = item.lesson.protoplasm.find( x => x.type === "dText" ).content,
        id = this.VIPSentence[1][ point ],
        row = uContext[ id ];

    // .. if it has no data yet!
    if ( !row[1].snap ) {
        tnsPLY.init( store.state.inHand.mediaPath );
        await tnsPLY.getDuration().then( secs => {
            if ( secs <= 0 ) { console.log( "File Corrupted!" ); return 0; }
            row[1].snap = tools.snapFinder( id, uContext, secs );
        } );
    }
    // .. still has no Data!
    if ( !row[1].snap ) return tools.toaster( "no success!" );

    row[1].snap += fac;

    let shortcut = point === "B" ? true : false;
    this.speaker( shortcut );

}

// -- =====================================================================================

speaker ( shortcut = false ) {

    let item = this.VIPSentence[1],
        uContext = item.lesson.protoplasm.find( x => x.type === "dText" ).content;

    // .. setUp speaker
    tnsPLY.init( store.state.inHand.mediaPath );
    tnsPLY.getDuration().then( secs => {

        if ( secs <= 0 ) { console.log( "File Corrupted!" ); return 0; }

        let start = tools.snapFinder( this.VIPSentence[1].A, uContext, secs );
        let stop  = tools.snapFinder( this.VIPSentence[1].B, uContext, secs );

        if ( start > stop ) {
            delete uContext[ this.VIPSentence[1].A ][1].snap;
            delete uContext[ this.VIPSentence[1].B ][1].snap;
            return this.speaker( shortcut );
        }

        // .. just a piece of phrase will play
        if ( shortcut && stop - start > 1 ) start = stop -1;
        // ..  just a word!
        if ( start === stop ) stop = start + this.VIPSentence[0].length * .1;

        // .. Play from A
        tnsPLY.play();
        tnsPLY.seekTo( start );
        // .. and Stop at B
        tnsPLY.stopAt( stop );
    } );

}

// -- =====================================================================================

translate () {

    // .. inFrame Translation
    const from = store.state.inHand.institute.toLowerCase();
    if ( !this.VIPSentence[1].translations ) this.VIPSentence[1].translations = {};
    let promises: [any,any] = [ this.VIPSentence[1].translations.en, this.VIPSentence[1].translations.fa ];

    if ( from === 'en' && !this.VIPSentence[1].translations.fa ) {
        promises = [
            " " , // .. No need to Translate
            tools.translator( from, 'fa', this.VIPSentence[0] )
        ];
    }

    if ( from !== 'en' && ( !this.VIPSentence[1].translations.fa || !this.VIPSentence[1].translations.en ) ) {
        promises = [
            tools.translator( from, 'en', this.VIPSentence[0] ) ,
            tools.translator( from, 'fa', this.VIPSentence[0] )
        ];
    }

    Promise.all(promises).then( data => {

        this.VIPSentence[1].translations.en = data[0] as string;
        this.VIPSentence[1].translations.fa = data[1] as string;

        let translations = this.VIPSentence[1].translations.fa;

        if ( data[0] !== " " ) {
            translations = this.VIPSentence[1].translations.en + "\n\n" + translations;
        }

        tools.toaster( translations , "long" );

    } )
    .catch ( err => { tools.toaster( err ) } );

}


// -- =====================================================================================

studyAct ( action: TS.studyActions ) {

    tnsPLY.stop();

    let idx = this.myFlashcards.findIndex( x => x[0] === this.VIPSentence[0] );
    let state_0 = { oldStep:0, lastVisit:Infinity, oldRedHit:0 };

    // .. register new trace
    if ( idx === -1 ) this.VIPSentence[1].studyHistory = state_0;
    // .. get last study data
    else this.lastStudyDataExtractor();

    // .. do calculations
    this.studyCalculator( action );

    // .. registering studyData
    this.studyDataRegistrator().then( () => this.nextSlide() );
    setTimeout( () => Bus.$emit( "Scope_DeskCtl", "down" ), 100 );

}

// -- =====================================================================================

lastStudyDataExtractor() {

    let now: number = ( new Date().getTime() /1000 ) | 0;

    let step: number = 0;
    let lastVisit: number = now;
    let redHit: number = 0;

    let idx = this.myFlashcards.findIndex( x => x[0] === this.VIPSentence[0] ),
        item = this.myFlashcards[ idx ][1];

    step = item.step;
    lastVisit = item.lastVisit;
    redHit = item.redHit ? item.redHit : 0;

    // .. this is first act [in this session] on this old Trace!
    if ( typeof this.VIPSentence[1].studyHistory === "undefined" ) {
        this.VIPSentence[1].studyHistory = {
            oldStep     : step      ,
            lastVisit   : lastVisit ,
            oldRedHit   : redHit    ,
        }
    }

}

// -- =====================================================================================

studyCalculator ( action: TS.studyActions ) {

    let baseTime = store.state.appConfig.baseTime;
    let now = ( new Date().getTime() /1000 ) | 0;
    let diff = now - this.VIPSentence[1].studyHistory.lastVisit;

    let passedTime = ( diff >= 0 ) ? diff : 0;
    let stepFactor = Math.log( passedTime / tools.day ) / Math.log( baseTime );
        stepFactor = ( stepFactor * 1.0 ) | 0;

    let oldRedHit = this.VIPSentence[1].studyHistory.oldRedHit;
    let newStep: number,
        newRedHit: number;

    switch ( action ) {
        case '+' : newStep = ++stepFactor;                           break;
        case '-' : newStep = --stepFactor; newRedHit = oldRedHit +1; break;
    }

    if ( newStep < 1 ) newStep = 1;

    // .. soft Registration for Audio Lesson on activeBox
    this.VIPSentence[1].studyHistory.acted = action;
    this.VIPSentence[1].studyHistory.newStep = newStep;
    this.VIPSentence[1].studyHistory.newRedHit = newRedHit;

}

// -- =====================================================================================

async studyDataRegistrator () {

    let now = ( new Date().getTime() /1000 ) | 0,
        idx = this.myFlashcards.findIndex( card => card[0] === this.VIPSentence[0] ),
        item: TS.Flashcard;

    // .. already found in fDB
    if ( idx > -1 ) item = this.myFlashcards[ idx ];
    // .. new Registration
    else {
        item = [ this.VIPSentence[0], {
            status      : null ,
            step        : null ,
            lastVisit   : null ,
            code        : this.VIPSentence[1].lesson.chromosome.code ,
            A           : this.VIPSentence[1].A ,
            B           : this.VIPSentence[1].B ,
            sync        : false ,
        } ];
        this.myFlashcards.push( item );
    }

    // .. registration sync status
    item[1].sync = false;
    // .. soft Registration for Audio Lesson on FlashCardsBox
    let isOut = this.VIPSentence[1].studyHistory.acted === "x";
    item[1].status = isOut ? "hidden" : "memorizing";
    item[1].step = this.VIPSentence[1].studyHistory.newStep;
    item[1].lastVisit = now;
    if ( this.VIPSentence[1].studyHistory.newRedHit || item[1].redHit ) {
        item[1].redHit = this.VIPSentence[1].studyHistory.newRedHit;
    }

}

// -- =====================================================================================

nWordLongPressed ( args ) {
    Bus.$emit( "Scope_DeskCtl", "up", args.object.text );
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .dark Page { background-color: transparent; }

    .bigBox {
        border-radius: 5;
        margin: 7;
    }

    .light .bigBox { background-color: rgba(201, 201, 201, 0.3) }
    .dark  .bigBox { background-color: rgba(36, 36, 36, 0.3) }

    .sentenceBox {
        border-color: #041320;
        border-width: 1;
        padding: 23 15;
        border-radius: 7;
    }

    .light .sentenceBox { background-color: #f8f8f8 }
    .dark  .sentenceBox { background-color: #0c0c08 }

    .buttonRow { border-radius: 7 }
    .light .buttonRow { background-color: rgba(248, 248, 248, 0) }
    .dark  .buttonRow { background-color: rgba(104, 104, 98, 0) }

    .summeryBox {
        text-align: right;
        margin: -15 8;
    }

    .summeryIcon { font-size: 30px }

    .summeryStepBox {
        text-align: right;
        font-family: TextMeOne-Regular;
        font-size: 11px;
        padding: 2 8 0 0;
    }

    .light .summeryStepBox { color:#555454 }
    .dark  .summeryStepBox { color:#777979 }

    .light .g { color: #069106; }
    .dark  .g { color: #069106; }

    .light .r { color: #9c0a42; }
    .dark  .r { color: #9c0a42; }

    .light .o { color: #333233; }
    .dark  .o { color: #919191; }

    .p {
        font-size: 27;
        width: 40;
        height: 40;
    }
    .light .p { color: #333233; }
    .dark  .p { color: #0a577a; }

    .light .x { color: #919191; }
    .dark  .x { color: #919191; }

    .t { font-size: 22px }

    .space {
        width: 2;
        margin: 0 12;
    }
    .light .space { background-color: #b5b7b8; }
    .dark  .space { background-color: #515557; }

    .mini { 
        font-size: 11;
        width: 20;
    }

/*                                          */
    .breakLine {
        height: 1;
        padding: 0;
        margin: 0;
    }

</style>