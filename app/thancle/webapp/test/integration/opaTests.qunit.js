sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'jp/co/zynas/thancle/test/integration/FirstJourney',
		'jp/co/zynas/thancle/test/integration/pages/EmployeesMain'
    ],
    function(JourneyRunner, opaJourney, EmployeesMain) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('jp/co/zynas/thancle') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheEmployeesMain: EmployeesMain
                }
            },
            opaJourney.run
        );
    }
);