import JsBarcode from 'jsbarcode';

const handlePrintBarcode = (itemId) => {
    // Create a new window
    const printWindow = window.open('', '_blank');

    // Create a canvas element
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, 'ITM-' + itemId.toString(), {
        format: 'CODE128',
        width: 2, // Width of a single bar
        height: 50, // Height of the barcode
        displayValue: true, // Display the text value below the barcode
        textMargin: 2, // Margin between the barcode and the text
        fontSize: 14 // Size of the text
    });
    const barcodeDataUrl = canvas.toDataURL('image/png');

    // Generate the HTML content for the new window
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        text-align: center;
                    }
                    .barcode-container {
                        width: 3.5in; // Width of 30252 label
                        height: 1.125in; // Height of 30252 label
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        page-break-after: always; // Ensure each barcode is printed on a separate label
                    }
                    .barcode-image {
                        max-width: 100%;
                        max-height: 100%;
                    }
                    @page {
                        margin: 0;
                        size: 3.5in 1.125in; // Set page size to match label size
                    }
                }
                </style>
            </head>
            <body>
                <div class="barcode-container">
                    <img class="barcode-image" src="${barcodeDataUrl}" />
                </div>
                <script>
                    window.onafterprint = function() {
                        window.close();
                    };
                    window.print();
                </script>
            </body>
        </html>
    `);

    // Close the document to finish writing to the new window
    printWindow.document.close();
};

export default handlePrintBarcode;
