import React, { useEffect, useRef } from "react";
import AdyenCheckout from "@adyen/adyen-web";
import moment from "moment";

const DropIn = (props) => {
  const dropin_container_ref = useRef();
  const voucher_container_ref = useRef();
  const { setResultCode } = props;

  useEffect(() => {
    const main = async () => {
      let clientKey = 'test_IPIM3BBQPBBEBHLQASQTYJHGTQ2VDL3I'
      console.log("listando metodos de pagamento");
      let paymentMethods = await fetch("http://localhost:4444/list", { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ value: 1000 })
            }   )
      .then(response => {
          console.log('PASSOU AQ')
          return response.json();
      })
      .catch(err => {
          console.log('Deu erro aq')
          console.error(err);
      })
      
      const configuration = {
        paymentMethodsResponse: paymentMethods,
        clientKey: clientKey,
        locale: "pt-BR",
        environment: "test",
        onSubmit: async (state, dropin) => {
          console.log('STATE', state);
          const data = {
            paymentData: state.data, // Dados para gerar o boleto
            reference: '1', // Referencia da mensalidade 
            inscricao: 21500, // Inscrição dos associados 
            deliveryDate: moment().add(3, 'days').toISOString() // Data de vencimento do boleto 
          }
          
          const boleto = await fetch('http://localhost:4444', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
              body: JSON.stringify(data)
          })
          .then(response => {
            console.log('PASSOU AQ 2')
            return response.json();
            })
            .catch(err => {
                console.log('Deu erro aq 2')
                console.error(err);
            })

            if(boleto.action) {
                console.log('handleAction /payments');
                // checkout.createFromAction(boleto.action).mount(voucher_container_ref);
                dropin.handleAction(boleto.action);
            } else {
                console.log('showFinalResult /payments');
                setResultCode(boleto.resultCode);
            }

        },
        onAdditionalDetails: (state, dropin) => {
          console.log("/payment/details");
        
        },
      };

      const checkout = new AdyenCheckout(configuration);
      checkout.create("dropin", {
        paymentMethodsConfiguration: {
            boletobancario: { // Configuração opcional do boletop
                personalDetailsRequired: false,
                billingAddressRequired: false, 
                showEmailAddress: false,
 
                // Pre configuração dos dados que serão enviados
                data: {
                    socialSecurityNumber: '12345678912',
                    firstName: 'Silva',
                    lastName: 'jose',
                    billingAddress: {
                        street: 'Rua Funcionarios',
                        houseNumberOrName: '952',
                        city: 'São Paulo',
                        postalCode: '04386040',
                        stateOrProvince: 'SP',
                        country: `BR`
                    },
                    shopperEmail: 'joses@test.com'
                }
            }
        }
    }).mount(dropin_container_ref.current);
    };
    main();
    console.log("in useEffect");
  }, [setResultCode]);

  return (
  <><p>teste</p><div ref={dropin_container_ref} id="dropin-container"></div><div ref={voucher_container_ref}></div></>);
};

export default DropIn;