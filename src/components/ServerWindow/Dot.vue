<template>
  
<!---------------------------------------------------------------------------------------->

    <Label :class="'dot ' + myClass" :text="String.fromCharCode( '0x' + 'f111' )" />

<!---------------------------------------------------------------------------------------->

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import * as NS                          from "@nativescript/core"
import * as TS                          from "@/../types/myTypes"
import store                            from "@/mixins/store"

// -- =====================================================================================

@Component ( { 
    components: { } 
} )

// -- =====================================================================================

export default class Dot extends Vue {

@Prop() isOn;
@Prop() isFullFill;

// -- =====================================================================================

get myClass () {

    if ( this.isFullFill ) return "fas fullfil";

    let myClass = this.isOn ? "fas on" : "far";
    
    return myClass;
}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */

    .dot {
        color: #313131;
        font-size: 8;
        text-align: center;
        margin: 4;
    }

    .on { color: #0c4f6e }
    .fullfil { color: #136813 }
    
</style>