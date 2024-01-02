import JsBarcode from 'jsbarcode';

const handlePrintBarcode = (itemId) => {
    // Create a new window
    const printWindow = window.open('', '_blank');

    // Create a canvas element
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, 'ITM-' + itemId.toString(), { format: 'CODE128' });
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
                        display: inline-block;
                        padding: 20px;
                        border: 1px solid #000;
                        text-align: left;
                    }
                    .barcode-image {
                        display: block;
                        margin-bottom: 10px;
                    }
                    .barcode-text {
                        font-size: 12px;
                        font-family: Arial, sans-serif;
                    }
                    @page {
                        margin: 0;
                        size: auto;
                    }
                }
                </style>
            </head>
            <body>
                <div class="barcode-container">
                    <img class="barcode-image" src="${barcodeDataUrl}" />
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
        </html>
    `);

    // Close the document to finish writing to the new window
    printWindow.document.close();
};

export default handlePrintBarcode;
