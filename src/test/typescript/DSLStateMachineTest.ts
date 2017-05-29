import { Log } from './../../main/typescript/util/log';
import { WordTree } from './../../main/typescript/Tree';
import { DSLStateMachine } from './../../main/typescript/DSLStateMachine';
import {StateMachine} from "../../main/typescript/StateMachine";
import * as mocha from 'mocha';

let logger = Log.getLogger();

describe("Test DSLStateMachine", () => {
    describe("Test run", () => {

        let simpleEntryContents = `trivial card
  Trivially simple card. The body of the card starts with spaces or TABs, that's all.`;
        let mediumEntryContents = `resourceCard
   [m4]  [s]sample_sound.wav[/s][/m]
   [m2][s]sample_picture.jpg[/s][/m]`;
        let complexEntryContents = `sample entry
example
sample {unsorted part} card
{the }sample headword
   •• [b]Special symbols that might require escaping:[/b]
   1. Tilde: I love this \~. • I love this ~. (The tilde replaces the first headword.)
   2. At-sign: \@ ([b]Note:[/b] Sub-entires are currently not supported by GoldenDict.)
   3. Brackets: \[ \] \{ \}
   \ 
   •• [b]Basic formatting:[/b]
   \[b\]bold text\[/b\] • [b]bold text[/b]
   \[i\]italics\[/i\] • [i]italics[/i]
   \[u\]underlined text\[/u\] • [u]underlined text[/u]
   CO\[sub\]2\[/sub\] • CO[sub]2[/sub] • subscript
   e=mc\[sup\]2\[/sup\] • e=mc[sup]2[/sup] • superscript
   \ 
   •• [b]Indents:[/b]
   [m0]\[m0\] - sets the left paragraph margin to 0 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m1]\[m1\] - sets the left paragraph margin to 1 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m2]\[m2\] - sets the left paragraph margin to 2 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m3]\[m3\] - sets the left paragraph margin to 3 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m4]\[m4\] - sets the left paragraph margin to 4 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m5]\[m5\] - sets the left paragraph margin to 5 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m6]\[m6\] - sets the left paragraph margin to 6 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m7]\[m7\] - sets the left paragraph margin to 7 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m8]\[m8\] - sets the left paragraph margin to 8 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   [m9]\[m9\] - sets the left paragraph margin to 9 spaces The corresponding closing tag of the paragraph is. \[/m\][/m]
   \ 
   •• [b {{comments}}]Zones:[/b]
   \{\{Comments are inside curly brackets\}\} • {{This is a comment which should be invisible.}}
   \[*\]\[ex\]example\[/ex\]\[/*\] • [*][ex]example[/ex][/*] (Lingvo specific: It is recommended to add \[*\] and \[/*\] around example).
   \[s\]sample.bmp\[/s\] • [s]sample.bmp[/s] • multimedia zone (used to add pictures or sound files into a dictionary entries ).
   \[p\]v.\[/p\] • [p]v.[/p] • labels are shown in a different colour
   str\['\]e\[/'\]ss  • str[']e[/']ss • A str[']e[/']ssed v[']o[/']wel in a w[']o[/']rd.
   \ 
   •• [b]Links:[/b]
   \<<typcial card\>> • <<typcial card>> • Recommended way to create a hyperlink to another card.
   \[ref\]link1\[/ref\] • [ref]link1[/ref]  • hyperlink to another card, not recommended, deprecated.
   \[url\]http://goldendict.org/\[/url\] • [url]http://goldendict.org/[/url] • link to a Web page
   \ 
   •• [b]Colors:[/b]
   \[c blue\]Blue text\[/c\] • [c blue]Blue text[/c]
   \   {{ Here's how you insert an empty space: slash and space after it }}
   Supported colour names:
	aliceblue: [c aliceblue]plain [u]underscore[/u] [i]italic[/i] [b]aliceblue[/c][/b]
	antiquewhite: [c antiquewhite]plain [u]underscore[/u] [i]italic[/i] [b]antiquewhite[/c][/b]
	aqua: [c cyan]plain [u]underscore[/u] [i]italic[/i] [b]aqua[/c][/b]
	aquamarine: [c aquamarine]plain [u]underscore[/u] [i]italic[/i] [b]aquamarine[/c][/b]
	azure: [c azure]plain [u]underscore[/u] [i]italic[/i] [b]azure[/c][/b]
	beige: [c beige]plain [u]underscore[/u] [i]italic[/i] [b]beige[/c][/b]
	bisque: [c bisque]plain [u]underscore[/u] [i]italic[/i] [b]bisque[/c][/b]
	blanchedalmond: [c blanchedalmond]plain [u]underscore[/u] [i]italic[/i] [b]blanchedalmond[/c][/b]
	blue: [c blue]plain [u]underscore[/u] [i]italic[/i] [b]blue[/c][/b]
	blueviolet: [c blueviolet]plain [u]underscore[/u] [i]italic[/i] [b]blueviolet[/c][/b]
	brown: [c brown]plain [u]underscore[/u] [i]italic[/i] [b]brown[/c][/b]
	burlywood: [c burlywood]plain [u]underscore[/u] [i]italic[/i] [b]burlywood[/c][/b]
	cadetblued: [c cadetblue]plain [u]underscore[/u] [i]italic[/i] [b]cadetblue[/c][/b]
	chartreuse: [c chartreuse]plain [u]underscore[/u] [i]italic[/i] [b]chartreuse[/c][/b]
	chocolate: [c chocolate]plain [u]underscore[/u] [i]italic[/i] [b]chocolate[/c][/b]
	coral: [c coral]plain [u]underscore[/u] [i]italic[/i] [b]coral[/c][/b]
	cornflower: [c cornflower]plain [u]underscore[/u] [i]italic[/i] [b]cornflower[/c][/b]
	cornsilk: [c cornsilk]plain [u]underscore[/u] [i]italic[/i] [b]cornsilk[/c][/b]
	crimson: [c crimson]plain [u]underscore[/u] [i]italic[/i] [b]crimson[/c][/b]
	cyan: [c cyan]plain [u]underscore[/u] [i]italic[/i] [b]cyan[/c][/b]
	darkblue: [c darkblue]plain [u]underscore[/u] [i]italic[/i] [b]darkblue[/c][/b]
	darkcyan: [c darkcyan]plain [u]underscore[/u] [i]italic[/i] [b]darkcyan[/c][/b]
	darkgoldenrod: [c darkgoldenrod]plain [u]underscore[/u] [i]italic[/i] [b]darkgoldenrod[/c][/b]
	darkgray: [c darkgray]plain [u]underscore[/u] [i]italic[/i] [b]darkgray[/c][/b]
	darkgreen: [c darkgreen]plain [u]underscore[/u] [i]italic[/i] [b]darkgreen[/c][/b]
	darkkhaki: [c darkkhaki]plain [u]underscore[/u] [i]italic[/i] [b]darkkhaki[/c][/b]
	darkmagenta: [c darkmagenta]plain [u]underscore[/u] [i]italic[/i] [b]darkmagenta[/c][/b]
	darkolivegreen: [c darkolivegreen]plain [u]underscore[/u] [i]italic[/i] [b]darkolivegreen[/c][/b]
	darkorange: [c darkorange]plain [u]underscore[/u] [i]italic[/i] [b]darkorange[/c][/b]
	darkorchid: [c darkorchid]plain [u]underscore[/u] [i]italic[/i] [b]darkorchid[/c][/b]
	darkred: [c darkred]plain [u]underscore[/u] [i]italic[/i] [b]darkred[/c][/b]
	darksalmon: [c darksalmon]plain [u]underscore[/u] [i]italic[/i] [b]darksalmon[/c][/b]
	darkseagreen: [c darkseagreen]plain [u]underscore[/u] [i]italic[/i] [b]darkseagreen[/c][/b]
	darkslateblue: [c darkslateblue]plain [u]underscore[/u] [i]italic[/i] [b]darkslateblue[/c][/b]
	darkslategray: [c darkslategray]plain [u]underscore[/u] [i]italic[/i] [b]darkslategray[/c][/b]
	darkturquoise: [c darkturquoise]plain [u]underscore[/u] [i]italic[/i] [b]darkturquoise[/c][/b]
	darkviolet: [c darkviolet]plain [u]underscore[/u] [i]italic[/i] [b]darkviolet[/c][/b]
	deeppink: [c deeppink]plain [u]underscore[/u] [i]italic[/i] [b]deeppink[/c][/b]
	deepskyblue: [c deepskyblue]plain [u]underscore[/u] [i]italic[/i] [b]deepskyblue[/c][/b]
	dimgray: [c dimgray]plain [u]underscore[/u] [i]italic[/i] [b]dimgray[/c][/b]
	dodgerblue: [c dodgerblue]plain [u]underscore[/u] [i]italic[/i] [b]dodgerblue[/c][/b]
	firebrick: [c firebrick]plain [u]underscore[/u] [i]italic[/i] [b]firebrick[/c][/b]
	floralwhite: [c floralwhite]plain [u]underscore[/u] [i]italic[/i] [b]floralwhite[/c][/b]
	forestgreen: [c forestgreen]plain [u]underscore[/u] [i]italic[/i] [b]forestgreen[/c][/b]
	fuchsia: [c magenta]plain [u]underscore[/u] [i]italic[/i] [b]fuchsia[/c][/b]
	gainsboro: [c gainsboro]plain [u]underscore[/u] [i]italic[/i] [b]gainsboro[/c][/b]
	ghostwhite: [c ghostwhite]plain [u]underscore[/u] [i]italic[/i] [b]ghostwhite[/c][/b]
	gold: [c gold]plain [u]underscore[/u] [i]italic[/i] [b]gold[/c][/b]
	goldenrod: [c goldenrod]plain [u]underscore[/u] [i]italic[/i] [b]goldenrod[/c][/b]
	gray: [c gray]plain [u]underscore[/u] [i]italic[/i] [b]gray[/c][/b]
	green: [c green]plain [u]underscore[/u] [i]italic[/i] [b]green[/c][/b]
	greenyellow: [c greenyellow]plain [u]underscore[/u] [i]italic[/i] [b]greenyellow[/c][/b]
	honeydew: [c honeydew]plain [u]underscore[/u] [i]italic[/i] [b]honeydew[/c][/b]
	hotpink: [c hotpink]plain [u]underscore[/u] [i]italic[/i] [b]hotpink[/c][/b]
	indianred: [c indianred]plain [u]underscore[/u] [i]italic[/i] [b]indianred[/c][/b]
	indigo: [c indigo]plain [u]underscore[/u] [i]italic[/i] [b]indigo[/c][/b]
	ivory: [c ivory]plain [u]underscore[/u] [i]italic[/i] [b]ivory[/c][/b]
	khaki: [c khaki]plain [u]underscore[/u] [i]italic[/i] [b]khaki[/c][/b]
	lavender: [c lavender]plain [u]underscore[/u] [i]italic[/i] [b]lavender[/c][/b]
	lavenderblush: [c lavenderblush]plain [u]underscore[/u] [i]italic[/i] [b]lavenderblush[/c][/b]
	lawngreen: [c lawngreen]plain [u]underscore[/u] [i]italic[/i] [b]lawngreen[/c][/b]
	lemonchiffon: [c lemonchiffon]plain [u]underscore[/u] [i]italic[/i] [b]lemonchiffon[/c][/b]
	lightblue: [c lightblue]plain [u]underscore[/u] [i]italic[/i] [b]lightblue[/c][/b]
	lightcoral: [c lightcoral]plain [u]underscore[/u] [i]italic[/i] [b]lightcoral[/c][/b]
	lightcyan: [c lightcyan]plain [u]underscore[/u] [i]italic[/i] [b]lightcyan[/c][/b]
	lightgoldenrodyellow: [c lightgoldenrodyellow]plain [u]underscore[/u] [i]italic[/i] [b]lightgoldenrodyellow[/c][/b]
	lightgreen: [c lightgreen]plain [u]underscore[/u] [i]italic[/i] [b]lightgreen[/c][/b]
	lightgray: [c lightgray]plain [u]underscore[/u] [i]italic[/i] [b]lightgray[/c][/b]
	lightpink: [c lightpink]plain [u]underscore[/u] [i]italic[/i] [b]lightpink[/c][/b]
	lightsalmon: [c lightsalmon]plain [u]underscore[/u] [i]italic[/i] [b]lightsalmon[/c][/b]
	lightseagreen: [c lightseagreen]plain [u]underscore[/u] [i]italic[/i] [b]lightseagreen[/c][/b]
	lightskyblue: [c lightskyblue]plain [u]underscore[/u] [i]italic[/i] [b]lightskyblue[/c][/b]
	lightslategray: [c lightslategray]plain [u]underscore[/u] [i]italic[/i] [b]lightslategray[/c][/b]
	lightsteelblue: [c lightsteelblue]plain [u]underscore[/u] [i]italic[/i] [b]lightsteelblue[/c][/b]
	lightyellow: [c lightyellow]plain [u]underscore[/u] [i]italic[/i] [b]lightyellow[/c][/b]
	lime: [c lime]plain [u]underscore[/u] [i]italic[/i] [b]lime[/c][/b]
	limegreen: [c limegreen]plain [u]underscore[/u] [i]italic[/i] [b]limegreen[/c][/b]
	linen: [c linen]plain [u]underscore[/u] [i]italic[/i] [b]linen[/c][/b]
	magenta: [c magenta]plain [u]underscore[/u] [i]italic[/i] [b]magenta[/c][/b]
	maroon: [c maroon]plain [u]underscore[/u] [i]italic[/i] [b]maroon[/c][/b]
	mediumaquamarine: [c mediumaquamarine]plain [u]underscore[/u] [i]italic[/i] [b]mediumaquamarine[/c][/b]
	mediumblue: [c mediumblue]plain [u]underscore[/u] [i]italic[/i] [b]mediumblue[/c][/b]
	mediumorchid: [c mediumorchid]plain [u]underscore[/u] [i]italic[/i] [b]mediumorchid[/c][/b]
	mediumpurple: [c mediumpurple]plain [u]underscore[/u] [i]italic[/i] [b]mediumpurple[/c][/b]
	mediumseagreen: [c mediumseagreen]plain [u]underscore[/u] [i]italic[/i] [b]mediumseagreen[/c][/b]
	mediumslateblue: [c mediumslateblue]plain [u]underscore[/u] [i]italic[/i] [b]mediumslateblue[/c][/b]
	mediumspringgreen: [c mediumspringgreen]plain [u]underscore[/u] [i]italic[/i] [b]mediumspringgreen[/c][/b]
	mediumturquoise: [c mediumturquoise]plain [u]underscore[/u] [i]italic[/i] [b]mediumturquoise[/c][/b]
	mediumvioletred: [c mediumvioletred]plain [u]underscore[/u] [i]italic[/i] [b]mediumvioletred[/c][/b]
	midnightblue: [c midnightblue]plain [u]underscore[/u] [i]italic[/i] [b]midnightblue[/c][/b]
	mintcream: [c mintcream]plain [u]underscore[/u] [i]italic[/i] [b]mintcream[/c][/b]
	mistyrose: [c mistyrose]plain [u]underscore[/u] [i]italic[/i] [b]mistyrose[/c][/b]
	moccasin: [c moccasin]plain [u]underscore[/u] [i]italic[/i] [b]moccasin[/c][/b]
	navajowhite: [c navajowhite]plain [u]underscore[/u] [i]italic[/i] [b]navajowhite[/c][/b]
	navy: [c navy]plain [u]underscore[/u] [i]italic[/i] [b]navy[/c][/b]
	oldlace: [c oldlace]plain [u]underscore[/u] [i]italic[/i] [b]oldlace[/c][/b]
	olive: [c olive]plain [u]underscore[/u] [i]italic[/i] [b]olive[/c][/b]
	olivedrab: [c olivedrab]plain [u]underscore[/u] [i]italic[/i] [b]olivedrab[/c][/b]
	orange: [c orange]plain [u]underscore[/u] [i]italic[/i] [b]orange[/c][/b]
	orangered: [c orangered]plain [u]underscore[/u] [i]italic[/i] [b]orangered[/c][/b]
	orchid: [c orchid]plain [u]underscore[/u] [i]italic[/i] [b]orchid[/c][/b]
	palegoldenrod: [c palegoldenrod]plain [u]underscore[/u] [i]italic[/i] [b]palegoldenrod[/c][/b]
	palegreen: [c palegreen]plain [u]underscore[/u] [i]italic[/i] [b]palegreen[/c][/b]
	paleturquoise: [c paleturquoise]plain [u]underscore[/u] [i]italic[/i] [b]paleturquoise[/c][/b]
	palevioletred: [c palevioletred]plain [u]underscore[/u] [i]italic[/i] [b]palevioletred[/c][/b]
	papayawhip: [c papayawhip]plain [u]underscore[/u] [i]italic[/i] [b]papayawhip[/c][/b]
	peachpuff: [c peachpuff]plain [u]underscore[/u] [i]italic[/i] [b]peachpuff[/c][/b]
	peru: [c peru]plain [u]underscore[/u] [i]italic[/i] [b]peru[/c][/b]
	pink: [c pink]plain [u]underscore[/u] [i]italic[/i] [b]pink[/c][/b]
	plum: [c plum]plain [u]underscore[/u] [i]italic[/i] [b]plum[/c][/b]
	powderblue: [c powderblue]plain [u]underscore[/u] [i]italic[/i] [b]powderblue[/c][/b]
	purple: [c purple]plain [u]underscore[/u] [i]italic[/i] [b]purple[/c][/b]
	red: [c red]plain [u]underscore[/u] [i]italic[/i] [b]red[/c][/b]
	rosybrown: [c rosybrown]plain [u]underscore[/u] [i]italic[/i] [b]rosybrown[/c][/b]
	royalblue: [c royalblue]plain [u]underscore[/u] [i]italic[/i] [b]royalblue[/c][/b]
	saddlebrown: [c saddlebrown]plain [u]underscore[/u] [i]italic[/i] [b]saddlebrown[/c][/b]
	salmon: [c salmon]plain [u]underscore[/u] [i]italic[/i] [b]salmon[/c][/b]
	sandybrown: [c sandybrown]plain [u]underscore[/u] [i]italic[/i] [b]sandybrown[/c][/b]
	seagreen: [c seagreen]plain [u]underscore[/u] [i]italic[/i] [b]seagreen[/c][/b]
	seashell: [c seashell]plain [u]underscore[/u] [i]italic[/i] [b]seashell[/c][/b]
	sienna: [c sienna]plain [u]underscore[/u] [i]italic[/i] [b]sienna[/c][/b]
	silver: [c silver]plain [u]underscore[/u] [i]italic[/i] [b]silver[/c][/b]
	skyblue: [c skyblue]plain [u]underscore[/u] [i]italic[/i] [b]skyblue[/c][/b]
	slateblue: [c slateblue]plain [u]underscore[/u] [i]italic[/i] [b]slateblue[/c][/b]
	slategray: [c slategray]plain [u]underscore[/u] [i]italic[/i] [b]slategray[/c][/b]
	snow: [c snow]plain [u]underscore[/u] [i]italic[/i] [b]snow[/c][/b]
	springgreen: [c springgreen]plain [u]underscore[/u] [i]italic[/i] [b]springgreen[/c][/b]
	steelblue: [c steelblue]plain [u]underscore[/u] [i]italic[/i] [b]steelblue[/c][/b]
	tan: [c tan]plain [u]underscore[/u] [i]italic[/i] [b]tan[/c][/b]
	teal: [c teal]plain [u]underscore[/u] [i]italic[/i] [b]teal[/c][/b]
	thistle: [c thistle]plain [u]underscore[/u] [i]italic[/i] [b]thistle[/c][/b]
	tomato: [c tomato]plain [u]underscore[/u] [i]italic[/i] [b]tomato[/c][/b]
	turquoise: [c turquoise]plain [u]underscore[/u] [i]italic[/i] [b]turquoise[/c][/b]
	violet: [c violet]plain [u]underscore[/u] [i]italic[/i] [b]violet[/c][/b]
	wheat: [c wheat]plain [u]underscore[/u] [i]italic[/i] [b]wheat[/c][/b]
	white: [c white]plain [u]underscore[/u] [i]italic[/i] [b]white[/c][/b]
	whitesmoke: [c whitesmoke]plain [u]underscore[/u] [i]italic[/i] [b]whitesmoke[/c][/b]
	yellow: [c yellow]plain [u]underscore[/u] [i]italic[/i] [b]yellow[/c][/b]
	yellowgreen: [c yellowgreen]plain [u]underscore[/u] [i]italic[/i] [b]yellowgreen[/c][/b]`;
        let typicalEntryContents = `typical card
   This is a typical card taken from Lingvo Documentation:
   \ 
   [b]1.[/b] [p]v.[/p]
   [m1]1) [p][trn]общ.[/p] отказываться [com]([i]от чего-л.[/i])[/com], прекращать [com]([i]что-л., делать что-л.[/i])[/com]; оставлять [com]([i]что-л.[/i])[/com][/trn][/m]
   [m2][*][ex][lang id=1033]to abandon a Bill[/lang] — отказаться от продвижения законопроекта[/ex][/*][/m]
   [m2][*][ex][lang id=1033]to abandon a claim \[a right, an action\][/lang] — отказаться от претензий \[от права, от иска\][/ex][/*][/m]
   [m2][*][ex][lang id=1033]to abandon (all) hope[/lang] — оставить (всякую) надежду[/ex][/*][/m]
   [m2][*][b]See:[/b][/*][/m]
   [m2][*][com][lang id=1033]abandoned property[/lang][/com][/*][/m]
   [m1]2) [p][trn]ec.[/p] закрывать; консервировать [com]([i]напр., транспортную линию, производство и т. п.[/i])[/com][/trn][/m]
   [m2][*][ex][lang id=1033]to abandon the transportation services[/lang] — заморозить транспортное обслуживание[/ex][/*][/m]
   [m1]3) [p][trn]общ.[/p] оставлять, уходить [com]([i]с поста и т. д.[/i])[/com]; покидать, оставлять [com]([i]что-л. или кого-л.[/i])[/com][/trn][/m]
   [m2][*][ex][lang id=1033]to be forced to abandon a position[/lang] — быть вынужденным оставить должность[/ex][/*][/m]
   [m2][*][ex][lang id=1033]He abandoned his family and went abroad.[/lang] — Он оставил свою семью и поехал за границу.[/ex][/*][/m]
   [m2][*][ex][lang id=1033]He abandoned his car and tried to escape on foot.[/lang] — Он бросил машину и попытался ускользнуть пешком.[/ex][/*][/m]
   [m2][*][b]See:[/b][/*][/m]
   [m2][*][ref dict="Marketing (En-Ru)"]abandonment[/ref][/*][/m]
   [b]2.[/b] [p]сущ.[/p]
   [m1][p][trn]общ.[/p] импульсивность; развязанность, несдержанность[/trn][/m]
   [m2][*][ex][lang id=1033]to do smth. with in complete abandon[/lang] — делать что-л., совершенно забыв обо всем[/ex][/*][/m]`;

        it("Simple entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(simpleEntryContents);
            let wordTree: WordTree = stateMachine.run();

            wordTree.entry.forEach(entry => {
                logger.debug(entry);
            })
        });
        it("Medium entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(mediumEntryContents);
            let wordTree: WordTree = stateMachine.run();

            wordTree.entry.forEach(entry => {
                logger.debug(entry);
            })
        });
        it("Complex entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(complexEntryContents);
            let wordTree: WordTree = stateMachine.run();

            wordTree.entry.forEach(entry => {
                logger.debug(entry);
            })
        });
        it("Typical entry test", () => {

            let stateMachine: StateMachine = new DSLStateMachine(typicalEntryContents);
            let wordTree: WordTree = stateMachine.run();

            wordTree.entry.forEach(entry => {
                logger.debug(entry);
            })
        });
    });
});