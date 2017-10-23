# Simulateur de prêt immobilier (plugin jQuery)

SIMULIMMO est un plugin jQuery permettant d'intégrer un (ou plusieurs) simulateur(s) de prêt immobilier de manière très simple au sein de sites internet.

Un site de démonstration est disponible ici : http://wwww.i-creativ.com/simulimmo/

![SIMULIMMO](/images/github-screenshot.png?raw=true "Site de démonstration")

## Prérequis

Le plugin SIMULIMMO requiert jQuery et jQuery UI pour fonctionner.
Au niveau jQuery UI, il n'utilise que le composant **slider**.

## Foctionnalités

SIMULIMMO est à même d'effectuer 3 simulations différentes :

- Calcul de mensualités
- Evaluation de la capacité d'emprunt
- Détermination de le durée d'un prêt

Dans les 3 cas de figure, l'assurance associée au prêt est prise en compte dans les calculs.

D'un point de vue webdesign, SIMULIMMO est totalement agnostique et ne possède pas de feuille de style associée. Il s'adapte automatiquement au "look en feel" existant pour peu qu'on lui fournisse les éléments DOM nécessaires à son fonctionnement. Dans le pire des cas, vous pourriez avoir besoin de modifier la feuille de style associée au composant **slider** de jQuery UI afin qu'il s'intègre à votre site de manière tout à fait transparente.

## Utilisation

SIMULIMMO est extremement simple à mettre en oeuvre et sa configuration par défaut est suffisament souple pour s'adapter à la majorité des cas d'utilisation.

Le plugin travaille avec de simples champs texte (5 au total) auxquels il associe des sliders qu'il crée lui-même aux emplacements que vous lui aurez désigné via de simple éléments DOM (ex: des DIVs). C'est donc vous qui maitrisez totalement l'aspect que prendra SIMULIMMO. Les champs texte et les sliders associés permettent à l'utilisateur de "questionner" le simulateur. En réponse, le plugin réagit instanténément en fournissant les données qu'il à a calculé, ainsi que celle que l'utilisateur a saisi, par le biais de hook qui ne sont autres que de simples fonctions callback. Il vous appartient ensuite d'interagir avec le DOM pour afficher celles qui vous intéressent.

### Configuration
La configuration par défaut du plugin est la suivante. Les noms des paramètres sont par ailleurs suffisament explicites pour que vous deviniez quels sont leur roles respectifs.

```javascript
    // Plugin default settings.
    var defaults = {

        // Borrowed capital field parameters.
        borrowedCapitalInputSelector: '.ls-borrowedCapitalInput',
        borrowedCapitalSliderSelector: '.ls-borrowedCapitalSlider',
        borrowedCapitalDefault: 100000,
        borrowedCapitalMin: 5000,
        borrowedCapitalMax: 400000,
        borrowedCapitalStep: 5000,

        // Loan duration field parameters.
        loanDurationInputSelector: '.ls-loanDurationInput',
        loanDurationSliderSelector: '.ls-loanDurationSlider',
        loanDurationDefault: 15,
        loanDurationMin: 2,
        loanDurationMax: 30,
        loanDurationStep: 1,

        // Interest rate field parameters.
        interestRateInputSelector: '.ls-interestRateInput',
        interestRateSliderSelector: '.ls-interestRateSlider',
        interestRateDefault: 1.75,
        interestRateMin: 0,
        interestRateMax: 10,
        interestRateStep: 0.05,

        // Insurance rate field parameters.
        insuranceRateInputSelector: '.ls-insuranceRateInput',
        insuranceRateSliderSelector: '.ls-insuranceRateSlider',
        insuranceRateDefault: 0.45,
        insuranceRateMin: 0,
        insuranceRateMax: 1,
        insuranceRateStep: 0.05,

        // Monthly fees field parameters.
        monthlyFeesInputSelector: '.ls-monthlyFeesInput',
        monthlyFeesSliderSelector: '.ls-monthlyFeesSlider',
        monthlyFeesDefault: 1000,
        monthlyFeesMin: 100,
        monthlyFeesMax: 5000,
        monthlyFeesStep: 100,

        // CSS class to apply to input field on invalid entered values
        invalidValueCss: 'ls-invalidValue',

        // Number of decimal in data passed to hook onUpdate().
        precision: 2,

        // Hooks
        onUpdate: function(data) {},
        onError: function() {}
    };
```

***NOTE :*** *Tous les paramètres peuvent également être fournis sous forme de fonctions callback. Ceci permet une lecture dynamique et contextuelle de ces derniers. Libre à vous de déterminer les cas où cela peut s'avérer utile et approprié.*

### Template HTML

Coté DOM / HTML, vous aurez à mettre en place un template ressemblant à peu près à ceci :

```html
    <div id="loan-form">
        <div>
            <label for="borrowedCapital">Montant du prêt</label>
            <input class="ls-borrowedCapitalInput" type="text" id="borrowedCapital">
            <div class="ls-borrowedCapitalSlider"></div>
        </div>
        <di>
            <label for="loanDuration">Durée d'emprunt</label>
            <input class="ls-loanDurationInput" type="text" id="loanDuration">
            <div class="ls-loanDurationSlider"></div>
        </div>
        <di>
            <label for="interestRate">Taux d'intérêt</label>
            <input class="ls-interestRateInput" type="text" id="interestRate">
            <div class="ls-interestRateSlider"></div>
        </div>
        <di>
            <label for="insuranceRate">Taux d'assurance</label>
            <input class="ls-insuranceRateInput" type="text" id="insuranceRate">
            <div class="ls-insuranceRateSlider"></div>
        </div>
    </div>
    <div id="loan-results">
        <p>Mensualités de remboursement&nbsp;: <span class="loan-monthly-fees">0.00&nbsp;€</span></p>
        <p>Coût total du crédit&nbsp;: <span class="loan-total-amount">0.00&nbsp;€</span></p>
        <p>Montant des intérêts&nbsp;: <span class="loan-interest-amount">0.00&nbsp;€</span></p>
        <p>Montant de l'assurance&nbsp;: <span class="loan-insurance-amount">0.00&nbsp;€</span></p>
    </div>
```

### Instanciation du plugin

L'instanciation du plugin consiste essentiellement en la définition des deux fonctions callback à associer aux hooks `onUpdate()` et `onError()` qui se chargent de manipuler le DOM pour effectuer les affichages :

```javascript
    $('#loan-form').loansimulator({

        // Traitement des affichages à effectuer
        // lorsque de nouvelles données sont disponibles.
        'onUpdate': function(data) {
            $('#loan-results .loan-monthly-fees').text(data.monthlyFees + ' €');
            $('#loan-results .loan-total-amount').text(data.loanAmount + ' €');
            $('#loan-results .loan-interest-amount').text(data.interestAmount + ' €');
            $('#loan-results .loan-insurance-amount').text(data.insuranceAmount + ' €');
        },

        // Traitement à effectuer en cas
        // de saisie d'une valeur invalide.
        'onError': function() {
            $('#loan-results span').text('Saisie invalide !');
        }
    });
```

### Données fournies par le plugin

L'argument `data` passé à la fonction de callback cablée sur le hook `onUpdate()` contient les données suivantes :

```javascript
    var data = {

        // Données en entrée dont une sera calculée,
        // en l'occurence, la propriété monthlyFees.
        'borrowedCapital': xxx,
        'loanDuration': xxx,
        'monthlyFees': xxx,
        'interestRate': xxx,
        'insuranceRate': xxx,

        // Données en sortie, calculées en réponse aux
        // modifications des champs texte et des sliders associés.
        'loanAmount': xxx,
        'interestAmount': xxx,
        'insuranceAmount': xxx,
        'totalAmount': xxx
    };
```

A chaque modification des champs texte ou des sliders, le plugin fournit un jeu de données comprenant à la fois celles qui ont été calculées et celle sasisies, qui ont servi au calcul effectué (cf. paragraphe suivant).

Les données systématiquement calculées sont les suivantes :

- Le cout du crédit une fois le prêt remboursé (`loanAmount`),
- La part que représentent les intérêts d'emprunt (`interestAmount`),
- La part que représentent l'assurance du crédit (`insuranceAmount`),
- Le cout global du prêt, somme empruntée comprise (`totalAmount`),

En plus de celles-ci, une des données entrante sera  également calculé par le plugin selon le type de calcul souhaité (Calcul de mensualités, Evaluation de la capacité d'emprunt, Détermination de le durée du prêt).

### Choix du calcul à effectuer

Comme énnoncé au début de ce document, SIMULIMMO peut effectuer trois calculs différents liant 5 valeurs entre elles :

- Le montant du prêt (`borrowedCapital`),
- La durée du crédit (`loanDuration`),
- Les mensualités de remboursement (`monthlyFees`),
- Le taux d'emprunt (`interestRate`),
- La taux de l'assurance (`insuranceRate`).

Le choix du calcul à effectué est en fait déterminé par les champs texte qui sont présents dans le DOM, sous l'élément auxquel le plugin a été rattaché lors de son instanciation. Dans l'exemple ci-dessus, vous remarquerez que la propriété `monthlyFees` (mensualtés de remboursement) n'a pas de champs texte correspodant. Le plugin, en déduit donc automatiquement que c'est l'inconnue que nous souhaitons résoudre et il effectuera le calcul adéquat pour y parvenir. Les deux autres inconnues que SIMULIMMO peut résoudre sont respectivement le montant du prêt (`borrowedCapital`) et sa durée (`loanDuration`).

### Traitement des erreurs

Le plugin n'affiche aucun message d'erreur à l'utilisateur. Il corrige lui-même les saisies de valeur invalides lorsque le champs perd le focus. Cepenedant, afin de signaler à l'utilisateur qu'une valeur qui est en train d'être saisie n'est pas correcte, SIMULIMMO fournit deux moyens :

- l'application d'une classe CSS sur le champs texte en erreur (cf. paramètre de configuration `invalidValueCss`) pour une mise en garde visuelle.
- le déclenchement du hook `onError()` permettant tout autre traitement en conséquence.

De plus, le plugin n'effectue aucun calcul tant qu'un champs en cours de saisie contient une valeur invalie et le hook `onUpdate()` n'est donc pas déclenché.

## Qualité des algorithmes de calcul et fiabilité des résultats

Seul le calcul des mensualités de remboursement est réellement fiable et il suppose que l'assurance souscrite couvre 100% de votre crédit.

Les algorithmes permettant l'évaluation de la capacité d'emprunt et la détermination de le durée d'un prêt sont quant à eux plus approximatifs et ne fournissent en aucun cas des résultats exacts. Il produisent néanmoins des résultats relativement représentatifs pour vous permettre de vous faire une idée assez proche d'une possible la réalité.

Je vous invite d'ailleurs à proposer des solutions plus fiables si vous en avez et que le coeur vous en dit ;) Pour cela, référez-vous à la section suivante.

## Comment contribuer ?

Les dysfonctionnements et demandes d'amélioration peuvent être remontés sur l'URL suivante :
* [Open Issues](https://github.com/webcoder31/endless/issues)

Et les propositions de correction ou d'amélioration sur celle-ci :
* [Open Pull Requests](https://github.com/webcoder31/endless/pulls)

## Licence

Le plugin SIMULIMMO est régi par la licence **CeCILL-C** de droit français et respecte les règles de distribution du logiciel libre. Vous pouvez utiliser, modifier et / ou redistribuer le plugin SIMULIMMO selon les termes de la licence **CeCILL-C** diffusée par le **CEA**, le **CNRS** et l'**INRIA** à l'adresse suivante: http://www.cecill.info.