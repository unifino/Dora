<template>
<GridLayout
    class="opt-item"
    :visibility="badgeActiveData.color !== 'off' ? 'visible' : 'collapsed'"
>

<!---------------------------------------------------------------------------------------->

    <nButton
        ref="luncher"
        :myClass="'opt-item fas ' + badgeActiveData.color"
        :myLabel="String.fromCharCode( '0x' + badgeActiveData.icon )"
        @tap="headToSalon_F()"
    />

    <Label
        class="count"
        :text="badgeActiveData.count"
        :visibility="badgeActiveData.count !== null ? 'visible' : 'hidden'"
    />

<!---------------------------------------------------------------------------------------->

</GridLayout>
</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Salon_F                          from "@/components/Salon/F/Salon_F.vue"

// -- =====================================================================================

@Component ( { 
    components: { nButton } 
} )

// -- =====================================================================================

export default class Salon_F_Icon extends Vue {

// -- =====================================================================================

badgeActiveData: { 
    icon: 'f5dc'|'f141',
    color: "init"|"blue"|"orange"|"green"|"red"|"off" , 
    count: number 
} = { icon: "f141", color: "init", count: null };

// -- =====================================================================================

mounted () {

    store.watch(
        state => state.needCalculation, 
        newVal => { try { this.badgeActiveDataSetter( newVal ) } catch {} }
    );

}

// -- =====================================================================================

badgeActiveDataSetter ( noNeedToCalculation ) {

    let color: "init"|"blue"|"orange"|"green"|"red"|"off",
        count: number,
        icon: 'f5dc'|'f141' = "f5dc",
        ins = store.state.inHand.institute;

    if ( noNeedToCalculation ) {
        color = "init";
        count = null;
        icon = "f141";
    }
    else {
        if ( store.state.activeBox[ ins ].length > 99  ) color = 'red';
        else if ( store.state.activeBox[ ins ].length > 60  ) color = 'orange';
        else if ( store.state.activeBox[ ins ].length > 40  ) color = 'blue';
        else if ( store.state.activeBox[ ins ].length > 0   ) color = 'green';
        else if ( store.state.activeBox[ ins ].length === 0 ) color = 'off';

        count = store.state.activeBox[ ins ].length;
    }

    this.badgeActiveData = {
        icon: icon,
        color: color,
        count: count
    }
    
}

// -- =====================================================================================

headToSalon_F () {

    if ( store.state.mode !== "idle" ) return 0;
    if ( !this.badgeActiveData.count ) return 0;

    store.state.placeTrigger.Salon_F = {
        position: ( this.$refs.luncher as any ).nativeView.getLocationInWindow(),
        size: ( this.$refs.luncher as any ).nativeView.getActualSize()
    } 

    Vue.prototype.$navigateTo( Salon_F, {
        frame            : "salon_F" ,
        backstackVisible : true ,
    } )

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>
/*                                          */
    .count {
        font-size: 12;
        font-family: Farsan-Regular;
        text-align: center;
        width: 18;
        height: 18;
        border-radius: 20;
        margin: 30 0 0 33;
        color: whitesmoke;
    }

    .light .count { background-color: rgba(20, 22, 12, 0.7) }
    .dark  .count { background-color: rgba(105, 98, 104, 0.5) }

    .light .transparent,
    .dark  .transparent { background-color: transparent; color: transparent; }

    .light .blue   { color:#1889bd; }
    .light .green  { color:#308a14; }
    .light .orange { color:#e2740d; }
    .light .red    { color:#b41313; }
    .light .init   { color:#95c5ce; }
    .light .off    { color:transparent; }

    .dark .blue    { color: #10597a; }
    .dark .green   { color: #296317; }
    .dark .orange  { color: #81450c; }
    .dark .red     { color: #8f1f1f; }
    .dark .init    { color: #747e80; }
    .dark .off     { color: transparent }

</style>