<template>

    <nButton
        myClass="opt-item search fas"
        :myLabel="String.fromCharCode( '0x' + 'f002' )"
        @tap="lunchSearchPanel"
    />

</template>

// -- =====================================================================================

<script lang="ts">

// -- =====================================================================================

// * npm i --save vue-class-component vue-property-decorator
import { Vue, Component, Prop }         from "vue-property-decorator"
import store                            from "@/mixins/store"
import nButton                          from "@/components/tools/n_Button.vue"
import Bus                              from "@/mixins/bus"
import SearchPanel                      from "@/components/Salon/S/SearchPanel.vue"

// -- =====================================================================================

@Component ( {
    components: { nButton }
} )

// -- =====================================================================================

export default class Search extends Vue {

// -- =====================================================================================

lunchSearchPanel () {

    let SearchPanel = this.$root.$children[0].$refs.SearchPanel as SearchPanel;
    SearchPanel.curtain( "show" );

}

// -- =====================================================================================

}

// -- =====================================================================================

</script>

// -- =====================================================================================

<style scoped>

/*                                          */
    .light .search { color: #287ccf }
    .dark  .search { color: #1f728b }

    .search {
        font-size: 29;
        transform: scaleX(-1);
    }

</style>