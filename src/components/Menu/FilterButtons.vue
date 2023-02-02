<template>
<GridLayout>

<!---------------------------------------------------------------------------------------->

    <ScrollView margin="15 0" orientation="horizontal" width="100%">

        <StackLayout orientation="horizontal" horizontalAlignment="center" >
            <nButton
                v-for="(button,i) of buttons_cef"
                :key="i"
                :myClass="'CEF_item ' + ( button.active ? button.title : '' )"
                :myLabel="button.title"
                @tap="toggleActive(i)"
                @long-press="toggleActive(i,true)"
            />
        </StackLayout>

    </ScrollView>

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
import * as tools                       from "@/mixins/tools"
import Bus                              from "@/mixins/bus"
import nButton                          from "@/components/tools/n_Button.vue"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class FilterButtons extends Vue {

// -- =====================================================================================

buttons_cef = [
    { title: "A1", active: true },
    { title: "A2", active: true },
    { title: "B1", active: true },
    { title: "B2", active: true },
    { title: "C1", active: true },
    { title: "C2", active: true }
]

// -- =====================================================================================

toggleActive ( id: number, restrictMode = false ) {
    if ( restrictMode ) for ( let x of this.buttons_cef ) x.active = false;
    this.buttons_cef[ id ].active = !this.buttons_cef[ id ].active;
    let showThese = this.buttons_cef.map( x => x.active ? x.title : false );
    // ! checkkkk
    // Bus.$emit( 'Institute_ShopListFilter', showThese  )
} 

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .CEF_item {
        width: 40;
        height: 40;
        font-size: 20;
        margin: 5 4;
        padding: -2 0 0 -2;
        border-radius: 6;
        text-align: center;
        font-family: Dosis-Regular;
        font-weight: bold;
    }

    .light .CEF_item { background-color: #4b4b4b; color: whitesmoke; }
    .dark  .CEF_item { background-color: #9e9e9e; color: rgb(36, 36, 36) }
    
    .light .A1 { background-color: #31bbe6 }
    .dark  .A1 { background-color: #2ca7cc }
    .light .A2 { background-color: #0f8db3 }
    .dark  .A2 { background-color: #1a82a1 }
    .light .B1 { background-color: #7bbb27 }
    .dark  .B1 { background-color: #54a017 }
    .light .B2 { background-color: #e6881c }
    .dark  .B2 { background-color: #c58715 }
    .light .C1 { background-color: #e64c1d }
    .dark  .C1 { background-color: #c53e15 }
    .light .C2 { background-color: #c515b6 }
    .dark  .C2 { background-color: #8d2f85 }

</style>