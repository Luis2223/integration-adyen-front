import React, { useEffect, useRef } from "react";
import AdyenCheckout from "@adyen/adyen-web";
import moment from "moment";
import RequestHttp from "./utils/requestHttp";

const DropIn = (props) => {
  const dropin_container_ref = useRef();
  const voucher_container_ref = useRef();
  const { setResultCode } = props;

  useEffect(() => {
    const main = async () => {
      const request = new RequestHttp('http://api-grupozelo.sensedia.com');
      
      const paymentMethods = await request.handleRequest({
        url: '/dev/payment/method/v1/payment-methods',
        method: 'get',
        body: {
          value: 1020,
          // blockedPayment: '',
          splitCardFundingSources: true
        }
      }).then(response => response)
      .catch(error => console.error(error));

      let clientKey = 'test_IPIM3BBQPBBEBHLQASQTYJHGTQ2VDL3I'
      console.log("listando metodos de pagamento");
      
      const configuration = {
        paymentMethodsResponse: paymentMethods,
        clientKey: clientKey,
        locale: "pt-BR",
        environment: "test",
        onSubmit: async (state, component) => {
          console.log('STATE', state.data.paymentMethod);
          const data = {
            paymentData: state.data, // Dados para gerar o boleto
            reference: '1', // Referencia da mensalidade 
            inscricao: 21157667, // Inscrição dos associados 
            deliveryDate: moment().add(3, 'days').toISOString(), // Data de vencimento do boleto 
            value: 10 * 100
          }

          if (state.data.paymentMethod.type === 'scheme') {
            console.log('CARTÃO')
            const cartao = await request.handleRequest({
              url: '/dev/payment/subscription/v1/subscriptions',
              method: 'post',
              body: data
            })
            .catch(err => {
                console.log('Deu erro aq 2')
                console.error(err);
            })

            if(cartao.action) {
                console.log('handleAction /payments');
                // checkout.createFromAction(boleto.action).mount(voucher_container_ref);
                component.handleAction(cartao.action);
            } else {
                console.log('showFinalResult /payments');
                setResultCode(cartao.resultCode);
            }
            
          } else {
            const boleto = await request.handleRequest({
              url: '/dev/payment/bank-slip/v1/bank-slips',
              method: 'post',
              body: data
            })
            .catch(err => {
                console.log('Deu erro aq 2')
                console.error(err);
            })

            if(boleto.action) {
                console.log('handleAction /payments');
                // checkout.createFromAction(boleto.action).mount(voucher_container_ref);
                component.handleAction(boleto.action);
            } else {
                console.log('showFinalResult /payments');
                setResultCode(boleto.resultCode);
            }

          }
          
          

        },
        // onAdditionalDetails: (state, dropin) => {
        //   console.log("/payment/details");
        
        // },
        onChange: (error) => {
          console.error(error);
        },
        onError: (error) => {
          console.error(error)
        }
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
                    socialSecurityNumber: '01642191612',
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
            },
            card: {
              enableStoreDetails: false,
              showPayButton: true,
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